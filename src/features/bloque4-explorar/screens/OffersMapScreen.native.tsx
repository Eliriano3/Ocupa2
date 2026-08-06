import React, { useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
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

  const offersWithLocation = offers?.filter(
    (offer) => offer.location && offer.location.lat && offer.location.lng
  );

  if (error) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 18.4861, // Santo Domingo por defecto
          longitude: -69.9312,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {offersWithLocation?.map((offer) => (
          <Marker
            key={offer.id!}
            coordinate={{
              latitude: offer.location!.lat,
              longitude: offer.location!.lng,
            }}
          >
            <Callout onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id! })}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{offer.jobTypeName || offer.jobTypeKey}</Text>
                <Text style={styles.calloutSubtitle}>{offer.contractType}</Text>
                <Text style={styles.calloutAction}>Tocar para ver detalle</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {loading && !offers && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  calloutContainer: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  calloutAction: {
    fontSize: 12,
    color: '#0066cc',
    textAlign: 'center',
  },
});
