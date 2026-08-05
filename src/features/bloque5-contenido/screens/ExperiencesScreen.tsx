/*
 * ----- MIS EXPERIENCIAS -----
 * Esta pantalla permite ver, agregar y eliminar las experiencias
 * laborales del usuario, incluyendo el tipo de trabajo y el certificado.
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { catalogApi, experiencesApi } from '@/api';
import type { Experience, JobType } from '@/api/types';
import { AppButton, AppInput, Card, EmptyState, Loader, Screen } from '@/components';
import { pickAndUploadImage } from '@/services/imageUpload';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function ExperiencesScreen() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [selectedJobTypeKey, setSelectedJobTypeKey] = useState<string | null>(null);

  const loadExperiences = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await experiencesApi.getMyExperiences();
      setExperiences(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar tus experiencias.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  useEffect(() => {
    // Los tipos de trabajo son solo para el formulario: si fallan, la
    // pantalla sigue funcionando, simplemente sin chips para elegir.
    catalogApi
      .getJobTypes()
      .then(setJobTypes)
      .catch(() => setJobTypes([]));
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCertificateUrl(null);
    setSelectedJobTypeKey(null);
    setFormError(null);
  };

  const handlePickCertificate = async () => {
    setFormError(null);
    setUploadingImage(true);
    try {
      const uploaded = await pickAndUploadImage();
      if (uploaded) setCertificateUrl(uploaded.url);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

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
      const created = await experiencesApi.createExperience({
        title: trimmedTitle,
        description: trimmedDescription,
        jobTypeKey: selectedJobTypeKey ?? undefined,
        certificateImage: certificateUrl ?? undefined,
      });
      setExperiences((current) => [created, ...current]);
      resetForm();
      setShowForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo agregar la experiencia.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (experience: Experience) => {
    if (!experience.id) return;
    Alert.alert(
      'Eliminar experiencia',
      `¿Seguro que quieres eliminar "${experience.title ?? 'esta experiencia'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(experience.id!);
            try {
              await experiencesApi.deleteExperience(experience.id!);
              setExperiences((current) => current.filter((item) => item.id !== experience.id));
            } catch (error) {
              Alert.alert(
                'No se pudo eliminar',
                error instanceof Error ? error.message : 'Intenta de nuevo.',
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <Screen>
        <Loader message="Cargando tus experiencias..." />
      </Screen>
    );
  }

  if (errorMessage) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudieron cargar tus experiencias"
          message={errorMessage}
          actionLabel="Reintentar"
          onAction={loadExperiences}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={experiences}
        keyExtractor={(item, index) => item.id ?? String(index)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            {showForm ? (
              <Card>
                <AppInput
                  label="Título"
                  placeholder="Ej. Cuidado de niños"
                  value={title}
                  onChangeText={setTitle}
                  required
                />
                <AppInput
                  label="Descripción"
                  placeholder="Cuenta en qué consistió tu experiencia"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  required
                  error={formError ?? undefined}
                />

                {jobTypes.length > 0 ? (
                  <>
                    <Text style={styles.certLabel}>Tipo de trabajo (opcional)</Text>
                    <View style={styles.chipsRow}>
                      {jobTypes.map((jobType) => {
                        const selected = jobType.key === selectedJobTypeKey;
                        return (
                          <Pressable
                            key={jobType.key}
                            onPress={() =>
                              setSelectedJobTypeKey(selected ? null : jobType.key ?? null)
                            }
                            style={[styles.chip, selected && styles.chipSelected]}
                          >
                            <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                              {jobType.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                <Text style={styles.certLabel}>Certificado (opcional)</Text>
                {certificateUrl ? (
                  <Image source={{ uri: certificateUrl }} style={styles.certPreview} />
                ) : null}
                <AppButton
                  title={certificateUrl ? 'Cambiar imagen' : 'Agregar imagen'}
                  variant="secondary"
                  loading={uploadingImage}
                  onPress={handlePickCertificate}
                  style={styles.certButton}
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
                    title="Guardar"
                    fullWidth={false}
                    loading={submitting}
                    onPress={handleCreate}
                  />
                </View>
              </Card>
            ) : (
              <AppButton title="Agregar experiencia" onPress={() => setShowForm(true)} />
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="Todavía no has agregado experiencias"
            message="Agrega tus experiencias previas para que los publicantes te conozcan mejor."
          />
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.experienceRow}>
              {item.certificateImage ? (
                <Image source={{ uri: item.certificateImage }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailFallback]}>
                  <Ionicons name="document-text-outline" size={20} color={colors.disabled} />
                </View>
              )}

              <View style={styles.experienceInfo}>
                <Text style={styles.experienceTitle}>{item.title ?? 'Sin título'}</Text>
                {item.jobTypeName ? (
                  <Text style={styles.experienceJobType}>{item.jobTypeName}</Text>
                ) : null}
                {item.description ? (
                  <Text style={styles.experienceDescription} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <AppButton
                title="Eliminar"
                variant="danger"
                fullWidth={false}
                loading={deletingId === item.id}
                onPress={() => handleDelete(item)}
              />
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
  certLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  certPreview: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
  },
  certButton: {
    marginBottom: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  experienceJobType: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  experienceDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});