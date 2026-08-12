import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Screen, Loader, ErrorMessage, AppButton } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import { useAsyncData } from '@/hooks';
import { offersApi, likesApi } from '@/api';
import type { ExploreStackParamList } from '../navigation/types';

type DetailRouteProp = RouteProp<ExploreStackParamList, 'OfferDetail'>;
type NavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'OfferDetail'>;

export default function OfferDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { offerId } = route.params;

  const fetchOffer = useCallback(() => {
    return offersApi.getOffer(offerId);
  }, [offerId]);

  const { data: offer, loading, error, refresh } = useAsyncData(fetchOffer, [fetchOffer]);

  const [liking, setLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const initialized = useRef(false);

  // Inicializar el estado local verificando con la lista de likes del servidor
  useEffect(() => {
    if (offer && !initialized.current) {
      likesApi.getMyLikes().then(likes => {
        const isPresent = likes.some(l => l.id === offerId);
        setIsLiked(!!offer.liked || isPresent);
        initialized.current = true;
      }).catch(() => {
        setIsLiked(!!offer.liked);
        initialized.current = true;
      });
    }
  }, [offer, offerId]);

  const handleLikeToggle = async () => {
    if (!offer) return;
    try {
      setLiking(true);
      const newStatus = !isLiked;
      
      // Optimistic update
      setIsLiked(newStatus);
      
      if (newStatus) {
        await likesApi.likeOffer(offerId);
      } else {
        await likesApi.unlikeOffer(offerId);
      }
      // Quitamos el refresh() aquí para que no traiga datos viejos del servidor
      // y vuelva a poner el corazón en blanco por error.
    } catch (e) {
      console.error(e);
      // Revertir si falla
      setIsLiked(!isLiked);
    } finally {
      setLiking(false);
    }
  };

  if (error) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={refresh} />
      </Screen>
    );
  }

  if (loading && !offer) {
    return (
      <Screen>
        <Loader message="Cargando detalles..." />
      </Screen>
    );
  }

  if (!offer) {
    return (
      <Screen>
        <Text style={styles.errorText}>Oferta no encontrada.</Text>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.container}>
        {offer.photo ? (
          <Image source={{ uri: offer.photo }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]} />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{offer.jobTypeName || offer.jobTypeKey}</Text>
          <Text style={styles.subtitle}>{offer.contractType} - Pago: {offer.payment?.amount} {offer.payment?.currency}</Text>
          
          <Text style={styles.sectionTitle}>Dirección</Text>
          <Text style={styles.text}>{offer.address}</Text>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.text}>{offer.description}</Text>

          {offer.deadline && (
            <Text style={styles.date}>Fecha límite: {new Date(offer.deadline).toLocaleDateString()}</Text>
          )}

          <View style={styles.actions}>
            <View style={styles.likeContainer}>
              <Pressable
                onPress={handleLikeToggle}
                disabled={liking}
                style={[styles.likeButton, isLiked && styles.likeButtonActive]}
              >
                {liking ? (
                  <ActivityIndicator size="small" color={isLiked ? "#0055cc" : "#0055cc"} />
                ) : (
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={28} 
                    color={isLiked ? "#0055cc" : "#666"} 
                  />
                )}
                <Text style={[styles.likeText, isLiked && { color: "#0055cc" }]}>
                  {isLiked ? 'Guardado en Mis Likes' : 'Dar Me Gusta'}
                </Text>
              </Pressable>
            </View>

            <AppButton
              title="Aplicar a esta oferta"
              onPress={() => navigation.navigate('ApplyToOffer', { offerId: offer.id! })}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  date: {
    marginTop: 16,
    fontSize: 14,
    color: '#d9534f',
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 24,
  },
  likeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  likeButtonActive: {
    backgroundColor: '#e6f0ff',
    borderColor: '#cce0ff',
    borderWidth: 1,
  },
  likeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
});
