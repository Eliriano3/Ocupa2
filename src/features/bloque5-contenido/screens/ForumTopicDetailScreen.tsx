/*
 * ----- DETALLE -----
 * Esta pantalla muestra la información de un tema del foro,
 * sus comentarios y permite agregar nuevos comentarios.
 */


import { useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
 
import { forumApi } from '@/api';
import type { ForumComment, ForumTopicDetail } from '@/api/types';
import { AppButton, AppInput, Card, EmptyState, Loader, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/theme';
 
import type { ContentStackParamList } from '../navigation/types';
 
type Route = RouteProp<ContentStackParamList, 'ForumTopicDetail'>;
 
// Toma  la fecha que recibe de la API y la convierte a un formato legible.

function formatDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
 
export default function ForumTopicDetailScreen() {
  const { params } = useRoute<Route>();
  const { topicId } = params;
 
  const [topic, setTopic] = useState<ForumTopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // Carga la información del tema junto con sus comentarios.
  const loadTopic = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMessage(null);
 
      try {
        const data = await forumApi.getTopic(topicId);
        setTopic(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar el tema.');
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [topicId],
  );
 
  useEffect(() => {
    loadTopic();
  }, [loadTopic]);
 // Publica un nuevo comentario y lo agrega a la lista.

  const handleComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      setCommentError('Escribe algo antes de comentar.');
      return;
    }
 
    setPosting(true);
    setCommentError(null);
 
    try {
      const created = await forumApi.createTopicComment(topicId, { body: trimmed });
      setTopic((current) =>
        current
          ? {
              ...current,
              comments: [...(current.comments ?? []), created],
              commentsCount: (current.commentsCount ?? 0) + 1,
            }
          : current,
      );
      setComment('');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'No se pudo publicar el comentario.');
    } finally {
      setPosting(false);
    }
  };
 
  if (loading) {
    return (
      <Screen>
        <Loader message="Cargando tema..." />
      </Screen>
    );
  }
 
  if (errorMessage || !topic) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudo cargar el tema"
          message={errorMessage ?? undefined}
          actionLabel="Reintentar"
          onAction={() => loadTopic()}
        />
      </Screen>
    );
  }
 
  const comments: ForumComment[] = topic.comments ?? [];
 
  return (
    <Screen padded={false} scroll={false}>
      <FlatList
        data={comments}
        keyExtractor={(item, index) => item.id ?? String(index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTopic(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Card style={styles.topicCard}>
            <Text style={styles.title}>{topic.title ?? 'Sin título'}</Text>
            <Text style={styles.author}>
              {topic.author?.nombre ?? 'Anónimo'} · {formatDate(topic.createdAt)}
            </Text>
            {topic.description ? (
              <Text style={styles.description}>{topic.description}</Text>
            ) : null}
            <Text style={styles.commentsHeading}>
              {comments.length} comentario{comments.length === 1 ? '' : 's'}
            </Text>
          </Card>
        }
        ListEmptyComponent={
          <EmptyState icon="chatbubble-outline" title="Todavía no hay comentarios" />
        }
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentAuthor}>{item.author?.nombre ?? 'Anónimo'}</Text>
            <Text style={styles.commentBody}>{item.body}</Text>
            <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
      />
 
      <View style={styles.composer}>
        <AppInput
          placeholder="Escribe un comentario..."
          value={comment}
          onChangeText={setComment}
          error={commentError ?? undefined}
          multiline
        />
        <AppButton title="Comentar" loading={posting} onPress={handleComment} />
      </View>
    </Screen>
  );
}
 
const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topicCard: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  author: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  commentsHeading: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  comment: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  commentAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  commentBody: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
  },
  commentDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  composer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
});
 