import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, Text, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Card, Loader, EmptyState, ErrorMessage } from '@/components';
import { useAsyncData } from '@/hooks';
import { likesApi } from '@/api';
import type { ExploreStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'MyLikes'>;

export default function MyLikesScreen() {
  const navigation = useNavigation<NavigationProp>();

  const fetchLikes = useCallback(() => {
    return likesApi.getMyLikes();
  }, []);

  const { data: offers, loading, error, refresh } = useAsyncData(fetchLikes, [fetchLikes]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (error) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll={false}>
      {loading && !offers ? (
        <Loader message="Cargando tus me gusta..." />
      ) : offers?.length === 0 ? (
        <EmptyState
          title="Aún no tienes ofertas guardadas"
          message="Dale 'Me gusta' a las ofertas que te interesen para guardarlas aquí."
          actionLabel="Explorar Ofertas"
          onAction={() => navigation.navigate('ExploreOffers')}
        />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContainer}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <Card
              onPress={() => navigation.navigate('OfferDetail', { offerId: item.id! })}
              style={styles.card}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.cardImage} />
              ) : null}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.jobTypeName || item.jobTypeKey}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.contractType} - {item.payment?.amount} {item.payment?.currency}
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
