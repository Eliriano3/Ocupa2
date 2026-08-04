/*
 * ----- VIDEOS -----
 * Pantalla de videos disponibles dentro de la aplicación.
 * Permite visualizar contenido de YouTube sin salir de la app,
 * utilizando el identificador del video para reproducirlo mediante un reproductor embebido.
 */

import YoutubePlayer from 'react-native-youtube-iframe';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
//import { WebView } from 'react-native-webview';
 
import { contentApi } from '@/api';
import type { Video } from '@/api/types';
import { AppButton, Card, EmptyState, Loader, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;
 
function thumbnailFor(video: Video): string | null {
  if (video.thumbnail) return video.thumbnail;
  if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  return null;
}
 
export default function VideosScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
 
  const loadVideos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
 
    try {
      const data = await contentApi.getVideos();
      const sorted = [...data].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      setVideos(sorted);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar los videos.',
      );
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);
 
  if (loading) {
    return (
      <Screen>
        <Loader message="Cargando videos..." />
      </Screen>
    );
  }
 
  if (errorMessage) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudieron cargar los videos"
          message={errorMessage}
          actionLabel="Reintentar"
          onAction={() => loadVideos()}
        />
      </Screen>
    );
  }
 
  return (
    <Screen padded={false}>
{playing && playing.youtubeId ? (
  <View style={styles.playerWrap}>
    <YoutubePlayer
      height={PLAYER_HEIGHT}
      play={true}
      videoId={playing.youtubeId}
    />

    <View style={styles.playerFooter}>
      <Text style={styles.playerTitle} numberOfLines={2}>
        {playing.title ?? 'Video'}
      </Text>

      <View style={styles.playerActions}>
        {/*playing.url ? (
          <AppButton
            title="Ver en YouTube"
            variant="secondary"
            fullWidth={false}
            onPress={() => Linking.openURL(playing.url!)}
          />
        ) : null*/}

        <AppButton
          title="Volver a la lista"
          variant="ghost"
          fullWidth={false}
          onPress={() => {
            setPlaying(null);
            setPlayerError(null);
          }}
        />
      </View>
    </View>
  </View>
) : null} 
 
      <FlatList
        data={videos}
        keyExtractor={(item, index) => item.id ?? item.youtubeId ?? String(index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadVideos(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState icon="videocam-outline" title="No hay videos por ahora" />
        }
        renderItem={({ item }) => {
          const thumbnail = thumbnailFor(item);
          return (
            <Card
              onPress={() => {
                console.log('VIDEO:', item);
                setPlaying(item);
              }}
            >
              <View style={styles.thumbnailWrap}>
                {thumbnail ? (
                  <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnail, styles.thumbnailFallback]} />
                )}
                <View style={styles.playBadge}>
                  <Ionicons name="play" size={20} color={colors.textInverse} />
                </View>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {item.title ?? 'Sin título'}
              </Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </Card>
          );
        }}
      />
    </Screen>
  );
}
 
const styles = StyleSheet.create({
  playerWrap: {
    backgroundColor: colors.text,
  },
  player: {
    width: SCREEN_WIDTH,
    height: PLAYER_HEIGHT,
  },
  playerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  playerErrorText: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  playerFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  playerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  playerTitle: {
    flex: 1,
    color: colors.textInverse,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  list: {
    padding: spacing.lg,
  },
  thumbnailWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11, 60, 122, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});