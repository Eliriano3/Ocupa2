import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Card, AppInput, Loader, EmptyState, ErrorMessage, AppButton } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import { useAsyncData } from '@/hooks';
import { offersApi } from '@/api';
import type { ExploreStackParamList } from '../navigation/types';
import type { ContractType } from '@/api/types';

type NavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'ExploreOffers'>;

export default function ExploreOffersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [jobTypeKey, setJobTypeKey] = useState('');
  const [contractType, setContractType] = useState<ContractType | ''>('');

  const fetchOffers = useCallback(() => {
    return offersApi.getOffers({
      jobTypeKey: jobTypeKey || undefined,
      contractType: (contractType as ContractType) || undefined,
    });
  }, [jobTypeKey, contractType]);

  const { data: offers, loading, error, refresh } = useAsyncData(fetchOffers, [fetchOffers]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.filtersContainer}>
        <AppInput
          placeholder="Buscar por tipo (ej. chofer)"
          value={jobTypeKey}
          onChangeText={setJobTypeKey}
        />
        <View style={{ height: 8 }} />
        <AppInput
          placeholder="Tipo de contrato (temporal, fijo, horas)"
          value={contractType}
          onChangeText={(val) => setContractType(val as any)}
        />
        <View style={styles.navButtons}>
          <AppButton
            title="Mapa"
            variant="ghost"
            onPress={() => navigation.navigate('OffersMap')}
          />
          <AppButton
            title="Mis Aplicaciones"
            variant="ghost"
            onPress={() => navigation.navigate('MyApplications')}
          />
          <AppButton
            title="Mis Likes"
            variant="ghost"
            onPress={() => navigation.navigate('MyLikes')}
          />
        </View>
      </View>

      {error ? (
        <ErrorMessage error={error} onRetry={refresh} />
      ) : loading && !offers ? (
        <Loader message="Buscando ofertas..." />
      ) : offers?.length === 0 ? (
        <EmptyState
          title="No hay ofertas"
          message="Intenta cambiar los filtros para encontrar más opciones."
          actionLabel="Actualizar"
          onAction={refresh}
        />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          renderItem={({ item }) => (
            <Card
              onPress={() => navigation.navigate('OfferDetail', { offerId: item.id! })}
              style={styles.card}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.cardImage} />
              ) : null}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.jobTypeName}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.location?.lat ? '📍 Mapa disponible' : ''} - {item.contractType}
                </Text>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#ccc',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
