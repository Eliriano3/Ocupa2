import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useAsyncData } from '@/hooks';
import { offersApi } from '@/api';
import { Loader, ErrorMessage, Screen } from '@/components';

export default function OffersMapScreen() {
  const fetchOffers = useCallback(() => offersApi.getOffers({}), []);
  const { data: offers, loading, error, refresh } = useAsyncData(fetchOffers, [fetchOffers]);

  const html = useMemo(() => {
    if (!offers) return '';
    
    // Santo Domingo por defecto si no hay ofertas
    let centerLat = 18.4861;
    let centerLng = -69.9312;

    const validOffers = offers.filter(o => o.location && o.location.lat && o.location.lng);
    if (validOffers.length > 0) {
      centerLat = validOffers[0].location!.lat;
      centerLng = validOffers[0].location!.lng;
    }

    const markers = validOffers.map(o => `
      var marker = L.marker([${o.location!.lat}, ${o.location!.lng}]).addTo(map);
      marker.bindPopup("<div style='font-family:sans-serif;'><b>${o.jobTypeName || o.jobTypeKey}</b><br>${o.contractType}<br>${o.payment?.amount || 0} ${o.payment?.currency || ''}</div>");
    `).join('\n');

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
          var map = L.map('map').setView([${centerLat}, ${centerLng}], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);
          ${markers}
        </script>
      </body>
      </html>
    `;
  }, [offers]);

  if (loading && !offers) return <Screen><Loader message="Cargando mapa..." /></Screen>;
  if (error) return <Screen><ErrorMessage error={error} onRetry={refresh} /></Screen>;

  return (
    <View style={styles.container}>
      {React.createElement('iframe', {
        srcDoc: html,
        style: { width: '100%', height: '100%', border: 0 }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
