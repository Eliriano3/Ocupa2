/*
 * ----- FORO -----
 * Esta pantalla muestra la lista de temas del foro y permite
 * crear nuevas publicaciones.
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
 
import { forumApi } from '@/api';
import type { ForumTopic } from '@/api/types';
import { AppButton, AppInput, Card, EmptyState, Loader, Screen } from '@/components';
import { colors, fontSize, spacing } from '@/theme';
 
import type { ContentStackParamList } from '../navigation/types';
 
type Navigation = NativeStackNavigationProp<ContentStackParamList>;
 
function formatDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
export default function ForumTopicsScreen() {
  const navigation = useNavigation<Navigation>();
 
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
 
  const loadTopics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
 
    try {
      const data = await forumApi.getTopics();
      setTopics(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar los temas.',
      );
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);
 
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFormError(null);
  };
 
  // Crea un nuevo tema y lo agrega a la lista.
  
  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
 
    if (!trimmedTitle || !trimmedDescription) {
      setFormError('Escribe un título y una descripción.');
      return;
    }
 
    setSubmitting(true);
    setFormError(null);
 
    try {
      const created = await forumApi.createTopic({
        title: trimmedTitle,
        description: trimmedDescription,
      });
      setTopics((current) => [created, ...current]);
      resetForm();
      setShowForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo crear el tema.');
    } finally {
      setSubmitting(false);
    }
  };
 
  if (loading) {
    return (
      <Screen>
        <Loader message="Cargando temas..." />
      </Screen>
    );
  }
 
  if (errorMessage) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudieron cargar los temas"
          message={errorMessage}
          actionLabel="Reintentar"
          onAction={() => loadTopics()}
        />
      </Screen>
    );
  }
 
  return (
    <Screen padded={false}>
      <FlatList
        data={topics}
        keyExtractor={(item, index) => item.id ?? String(index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTopics(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {showForm ? (
              <Card>
                <AppInput
                  label="Título"
                  placeholder="¿De qué quieres hablar?"
                  value={title}
                  onChangeText={setTitle}
                  required
                />
                <AppInput
                  label="Descripción"
                  placeholder="Cuenta los detalles..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  required
                  error={formError ?? undefined}
                />
                <View style={styles.formActions}>
                  <AppButton
                    title="Cancelar"
                    variant="ghost"
                    fullWidth={false}
                    disabled={submitting}
                    onPress={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  />
                  <AppButton
                    title="Publicar"
                    fullWidth={false}
                    loading={submitting}
                    onPress={handleCreate}
                  />
                </View>
              </Card>
            ) : (
              <AppButton title="Nuevo tema" onPress={() => setShowForm(true)} />
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Todavía no hay temas"
            message="Sé la primera en abrir una conversación."
          />
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => {
              if (item.id) navigation.navigate('ForumTopicDetail', { topicId: item.id });
            }}
          >
            <Text style={styles.title} numberOfLines={2}>
              {item.title ?? 'Sin título'}
            </Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{item.author?.nombre ?? 'Anónimo'}</Text>
              <Text style={styles.meta}>
                {item.commentsCount ?? 0} comentario{item.commentsCount === 1 ? '' : 's'}
              </Text>
              <Text style={styles.meta}>{formatDate(item.lastActivityAt ?? item.createdAt)}</Text>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
 
const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});