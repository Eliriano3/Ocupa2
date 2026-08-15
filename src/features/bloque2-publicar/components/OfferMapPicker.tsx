/**
 * Mapa del paso 2: el usuario arrastra el mapa y el pin del centro marca dónde
 * queda el trabajo. Devuelve las coordenadas que van en `OfferInput.location`.
 *
 * Hay una versión aparte para web (`OfferMapPicker.web.tsx`), igual que hizo el
 * Bloque 4: `react-native-maps` no funciona en el navegador.
 *
 *   <OfferMapPicker value={location} onChange={setLocation} onUseMyLocation={ubicarme} />
 */

import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import type { GeoLocation } from '@/api/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { MAP_HEIGHT, TOUCH_TARGET } from '../constants';

/** Santo Domingo, para centrar el mapa antes de tener el GPS. */
const DEFAULT_REGION: Region = {
  latitude: 18.4861,
  longitude: -69.9312,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

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
  const map = useRef<MapView>(null);

  // Cuando llega el GPS, el mapa se mueve solo hasta ahí.
  useEffect(() => {
    if (!value) return;
    map.current?.animateToRegion(
      { latitude: value.lat, longitude: value.lng, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      300,
    );
  }, [value]);

  return (
    <View style={styles.container}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        // El pin está fijo en el centro: lo que se mueve es el mapa.
        onRegionChangeComplete={(region) =>
          onChange({ lat: region.latitude, lng: region.longitude })
        }
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
