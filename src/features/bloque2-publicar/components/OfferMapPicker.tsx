/**
 * Mapa del paso 2: el usuario arrastra el mapa y el pin del centro marca dónde
 * queda el trabajo. Devuelve las coordenadas que van en `OfferInput.location`.
 *
 * Usa Leaflet + OpenStreetMap dentro de un WebView, igual que el mapa de
 * explorar del Bloque 4. Antes era `react-native-maps`, que obliga a tener una
 * API key de Google configurada en el build: con Leaflet el mapa funciona en
 * Expo Go y en el APK sin depender de ninguna cuenta.
 *
 * Hay una versión aparte para web (`OfferMapPicker.web.tsx`), porque WebView no
 * existe en el navegador.
 *
 *   <OfferMapPicker value={location} onChange={setLocation} onUseMyLocation={ubicarme} />
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import type { GeoLocation } from '@/api/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { MAP_HEIGHT, TOUCH_TARGET } from '../constants';

/** Santo Domingo, para centrar el mapa antes de tener el GPS. */
const DEFAULT_CENTER: GeoLocation = { lat: 18.4861, lng: -69.9312 };
const DEFAULT_ZOOM = 12;
/** Zoom al que se acerca el mapa cuando llega la ubicación del GPS. */
const LOCATED_ZOOM = 16;

/** Dos coordenadas son «la misma» si difieren menos que esto (~10 cm). */
const SAME_COORD_EPSILON = 0.000001;

function isSameLocation(a: GeoLocation | null, b: GeoLocation | null): boolean {
  if (!a || !b) return false;
  return (
    Math.abs(a.lat - b.lat) < SAME_COORD_EPSILON && Math.abs(a.lng - b.lng) < SAME_COORD_EPSILON
  );
}

export interface OfferMapPickerProps {
  value: GeoLocation | null;
  onChange: (location: GeoLocation) => void;
  /** Botón de «centrar en mi ubicación». */
  onUseMyLocation: () => void;
  locating?: boolean;
}

export function OfferMapPicker({
  value,
  onChange,
  onUseMyLocation,
  locating = false,
}: OfferMapPickerProps) {
  const webView = useRef<WebView>(null);

  /**
   * Última coordenada que mandó el mapa. Sirve para no reenviarle al mapa la
   * posición que él mismo acaba de reportar, que lo dejaría en un bucle de
   * mover → avisar → mover.
   */
  const lastReported = useRef<GeoLocation | null>(null);

  /**
   * El HTML se arma una sola vez: si cambiara, el WebView recargaría y el mapa
   * volvería al principio en medio del gesto del usuario. Los movimientos
   * posteriores se hacen inyectando JavaScript, no regenerando el documento.
   */
  const html = useMemo(() => {
    const start = value ?? DEFAULT_CENTER;
    const zoom = value ? LOCATED_ZOOM : DEFAULT_ZOOM;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${start.lat}, ${start.lng}], ${zoom});

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Cuando el movimiento lo ordena la app (botón de ubicarme), no se
          // reporta de vuelta: evita el ida y vuelta infinito.
          var moviendoDesdeLaApp = false;

          window.centrarEn = function (lat, lng, zoom) {
            moviendoDesdeLaApp = true;
            map.setView([lat, lng], zoom || map.getZoom());
          };

          map.on('moveend', function () {
            if (moviendoDesdeLaApp) {
              moviendoDesdeLaApp = false;
              return;
            }
            var centro = map.getCenter();
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ lat: centro.lat, lng: centro.lng })
            );
          });
        </script>
      </body>
      </html>
    `;
    // Solo el primer render decide dónde abre el mapa; después manda el usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando llega el GPS, el mapa se mueve solo hasta ahí.
  useEffect(() => {
    if (!value) return;
    if (isSameLocation(value, lastReported.current)) return;

    webView.current?.injectJavaScript(
      `window.centrarEn && window.centrarEn(${value.lat}, ${value.lng}, ${LOCATED_ZOOM}); true;`,
    );
  }, [value]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const coords = JSON.parse(event.nativeEvent.data) as GeoLocation;
        if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return;

        lastReported.current = coords;
        onChange(coords);
      } catch {
        // Un mensaje que no se entiende no debe tumbar el formulario.
      }
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webView}
        originWhitelist={['*']}
        source={{ html }}
        style={StyleSheet.absoluteFill}
        onMessage={handleMessage}
      />

      {/* Pin del centro. `pointerEvents="none"` para no robarle el gesto al mapa. */}
      <View style={styles.pinLayer} pointerEvents="none">
        <View style={styles.pinHalo} />
        <View style={styles.pin} />
      </View>

      <Pressable
        onPress={onUseMyLocation}
        disabled={locating}
        accessibilityRole="button"
        accessibilityLabel="Centrar en mi ubicación"
        style={styles.locateButton}
      >
        <Ionicons
          name={locating ? 'ellipsis-horizontal' : 'locate'}
          size={20}
          color={colors.primary}
        />
      </Pressable>

      <Text style={styles.caption}>Arrastra el mapa para ajustar el punto exacto.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  pinLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  pinHalo: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.35,
    transform: [{ rotate: '45deg' }],
  },
  locateButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  caption: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});
