/*
 * ----- NOTICIAS -----
 * Pantalla que muestra el listado de noticias disponibles.
 * Obtiene la información desde la API y permite consultar el detalle de cada noticia.
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
 
import { contentApi } from '@/api';
import type { NewsItem } from '@/api/types';
import { Card, EmptyState, Loader, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
 
import type { PublicContentStackParamList } from '../navigation/types';
 
type Navigation = NativeStackNavigationProp<PublicContentStackParamList>;
 
export default function NewsListScreen() {
  const navigation = useNavigation<Navigation>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  const loadNews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
 
    try {
      const data = await contentApi.getNews({ limit: 20 });
      setNews(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar las noticias.',
      );
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadNews();
  }, [loadNews]);
 
  if (loading) {
    return (
      <Screen>
        <Loader message="Cargando noticias..." />
      </Screen>
    );
  }
 
  if (errorMessage) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudieron cargar las noticias"
          message={errorMessage}
          actionLabel="Reintentar"
          onAction={() => loadNews()}
        />
      </Screen>
    );
  }
 
  return (
    <Screen padded={false}>
      <FlatList
        data={news}
        keyExtractor={(item, index) => item.url ?? String(index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNews(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="No hay noticias por ahora"
            message="Vuelve a intentarlo más tarde."
          />
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('NewsDetail', { item })}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {item.title ?? 'Sin título'}
            </Text>
            {item.summary ? (
              <Text style={styles.summary} numberOfLines={3}>
                {item.summary}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {item.source ? <Text style={styles.meta}>{item.source}</Text> : null}
              {item.date ? <Text style={styles.meta}>{formatDate(item.date)}</Text> : null}
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
 
function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});