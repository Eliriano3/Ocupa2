import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, ErrorMessage } from '@/components';
import { useAsyncData } from '@/hooks';
import { offersApi } from '@/api';
import type { ExploreStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'OffersMap'>;

export default function OffersMapScreen() {
  const navigation = useNavigation<NavigationProp>();

  const fetchOffers = useCallback(() => {
    return offersApi.getOffers();
  }, []);

  const { data: offers, loading, error, refresh } = useAsyncData(fetchOffers, [fetchOffers]);

  const offersWithLocation = useMemo(() => {
    return offers?.filter(
      (offer) => offer.location && offer.location.lat && offer.location.lng
    ) || [];
  }, [offers]);

  const html = useMemo(() => {
    if (!offers) return '';

    // Santo Domingo por defecto
    let centerLat = 18.4861;
    let centerLng = -69.9312;

    if (offersWithLocation.length > 0) {
      centerLat = offersWithLocation[0].location!.lat;
      centerLng = offersWithLocation[0].location!.lng;
    }

    const markers = offersWithLocation
      .map((o) => {
        const title = (o.jobTypeName || o.jobTypeKey || 'Trabajo').replace(/'/g, "\\'");
        const contract = (o.contractType || '').replace(/'/g, "\\'");
        const amount = o.payment?.amount || 0;
        const currency = (o.payment?.currency || '').replace(/'/g, "\\'");
        const id = o.id || '';

        return `
          var marker = L.marker([${o.location!.lat}, ${o.location!.lng}]).addTo(map);
          marker.bindPopup('<div style="font-family: sans-serif; padding: 4px; min-width: 140px;"><b style="font-size: 14px; display: block; margin-bottom: 4px;">${title}</b><span style="color: #666; font-size: 12px; display: block; margin-bottom: 4px;">${contract}</span><span style="color: #1E8E5A; font-weight: bold; font-size: 12px; display: block; margin-bottom: 8px;">${amount} ${currency}</span><button style="width: 100%; padding: 8px; background-color: #0B3C7A; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;" onclick="window.ReactNativeWebView.postMessage(\\'${id}\\')">Ver detalle</button></div>');
        `;
      })
      .join('\n');

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
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 4px;
          }
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
  }, [offers, offersWithLocation]);

  const handleMessage = (event: any) => {
    const offerId = event.nativeEvent.data;
    if (offerId) {
      navigation.navigate('OfferDetail', { offerId });
    }
  };

  if (error) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      {html ? (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={StyleSheet.absoluteFill}
          onMessage={handleMessage}
        />
      ) : null}

      {loading && !offers && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0B3C7A" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

