/**
 * Detalle del aplicante — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /offers/{id}/applications, PATCH /applications/{id}
 *
 * Muestra el comentario y las respuestas del aplicante, y permite
 * calificar (1-5), descartar, marcar finalista o elegir ganador.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { applicationsApi } from '@/api';
import type { ApplicationStatus } from '@/api';
import { AppButton, Card, ErrorMessage, Loader, Screen } from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { ContractsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ContractsStackParamList, 'ApplicantDetail'>;
type RouteT = RouteProp<ContractsStackParamList, 'ApplicantDetail'>;

/* ---- Helpers ---- */

function statusColor(status?: string): string {
  switch (status) {
    case 'applied':
      return colors.primary;
    case 'finalist':
      return colors.warning;
    case 'winner':
      return colors.success;
    case 'discarded':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

function statusLabel(status?: string): string {
  switch (status) {
    case 'applied':
      return 'Aplicó';
    case 'finalist':
      return 'Finalista';
    case 'winner':
      return 'Ganador';
    case 'discarded':
      return 'Descartado';
    default:
      return status ?? '—';
  }
}

/* ---- Star Rating component ---- */

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => !disabled && onChange(n)}
          hitSlop={6}
          accessibilityLabel={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          <Ionicons
            name={n <= value ? 'star' : 'star-outline'}
            size={32}
            color={n <= value ? colors.accent : colors.disabled}
          />
        </Pressable>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
});

/* ---- Screen ---- */

export default function ApplicantDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { offerId, applicationId } = route.params;

  const [submitting, setSubmitting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [localRating, setLocalRating] = useState<number>(0);

  // Fetch all applications for the offer and find the one we need.
  // There's no single-application endpoint in the API.
  const { data: applications, loading, error, reload, refreshing, refresh } =
    useAsyncData(
      () => applicationsApi.getOfferApplications(offerId),
      [offerId],
    );

  const application = useMemo(
    () => applications?.find((a) => a.id === applicationId) ?? null,
    [applications, applicationId],
  );

  // Sync localRating when application data loads / changes
  useEffect(() => {
    if (application?.rating) setLocalRating(application.rating);
  }, [application?.rating]);

  /* ---- Actions ---- */

  const handleRate = useCallback(
    async (rating: number) => {
      setLocalRating(rating);
      setActionError(null);
      setSubmitting('rating');
      try {
        await applicationsApi.updateApplication(applicationId, { rating });
        await reload();
      } catch (err) {
        setActionError(err);
      } finally {
        setSubmitting(null);
      }
    },
    [applicationId, reload],
  );

  const handleStatusChange = useCallback(
    (newStatus: ApplicationStatus, label: string) => {
      Alert.alert(
        `¿${label}?`,
        newStatus === 'winner'
          ? 'Al elegir como ganador se crea un contrato automáticamente. ¿Continuar?'
          : `¿Estás seguro de que quieres ${label.toLowerCase()} a este aplicante?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: newStatus === 'discarded' ? 'destructive' : 'default',
            onPress: async () => {
              setActionError(null);
              setSubmitting(newStatus);
              try {
                const updated = await applicationsApi.updateApplication(
                  applicationId,
                  { status: newStatus },
                );
                await reload();
                if (newStatus === 'winner' && updated.contractId) {
                  Alert.alert(
                    '¡Ganador elegido!',
                    'Se creó el contrato automáticamente. ¿Quieres verlo?',
                    [
                      { text: 'Más tarde' },
                      {
                        text: 'Ver contrato',
                        onPress: () =>
                          navigation.navigate('ContractDetail', {
                            contractId: updated.contractId!,
                          }),
                      },
                    ],
                  );
                }
              } catch (err) {
                setActionError(err);
              } finally {
                setSubmitting(null);
              }
            },
          },
        ],
      );
    },
    [applicationId, reload, navigation],
  );

  /* ---- Render ---- */

  if (loading) return <Loader message="Cargando aplicante…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} fullScreen />;
  if (!application) {
    return (
      <Screen scroll>
        <ErrorMessage error="No se encontró la aplicación." onRetry={reload} />
      </Screen>
    );
  }

  const isResolved =
    application.status === 'winner' || application.status === 'discarded';

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* ---- Applicant header ---- */}
      <View style={styles.header}>
        <Ionicons
          name="person-circle-outline"
          size={64}
          color={colors.primary}
        />
        <Text style={styles.name}>
          {application.applicant?.nombre ?? 'Aplicante'}
        </Text>
        {application.applicant?.email && (
          <Text style={styles.email}>{application.applicant.email}</Text>
        )}
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColor(application.status) },
          ]}
        >
          <Text style={styles.badgeText}>
            {statusLabel(application.status)}
          </Text>
        </View>
      </View>

      {/* ---- Comment ---- */}
      <Card>
        <Text style={styles.sectionTitle}>Comentario</Text>
        <Text style={styles.commentText}>
          {application.comment || 'Sin comentario.'}
        </Text>
      </Card>

      {/* ---- Answers ---- */}
      {application.answers && application.answers.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Respuestas</Text>
          {application.answers.map((answer, i) => (
            <View key={answer.questionId ?? i} style={styles.answerItem}>
              <Text style={styles.answerLabel}>
                {answer.label ?? `Pregunta ${i + 1}`}
              </Text>
              <Text style={styles.answerValue}>
                {String(
                  typeof answer.value === 'boolean'
                    ? answer.value
                      ? 'Sí'
                      : 'No'
                    : (answer.value ?? '—'),
                )}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* ---- Rating ---- */}
      <Card>
        <Text style={styles.sectionTitle}>Calificación</Text>
        <StarRating
          value={localRating}
          onChange={handleRate}
          disabled={submitting === 'rating'}
        />
        {submitting === 'rating' && (
          <Text style={styles.savingText}>Guardando…</Text>
        )}
      </Card>

      {/* ---- Action error ---- */}
      {actionError ? <ErrorMessage error={actionError} /> : null}

      {/* ---- Action buttons (only if not resolved) ---- */}
      {!isResolved && (
        <Card>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <View style={styles.actionsCol}>
            {application.status !== 'finalist' && (
              <AppButton
                title="⭐ Marcar finalista"
                variant="secondary"
                onPress={() =>
                  handleStatusChange('finalist', 'Marcar finalista')
                }
                loading={submitting === 'finalist'}
                disabled={submitting !== null}
              />
            )}
            <AppButton
              title="🏆 Elegir ganador"
              variant="primary"
              onPress={() => handleStatusChange('winner', 'Elegir ganador')}
              loading={submitting === 'winner'}
              disabled={submitting !== null}
            />
            <AppButton
              title="Descartar"
              variant="danger"
              onPress={() => handleStatusChange('discarded', 'Descartar')}
              loading={submitting === 'discarded'}
              disabled={submitting !== null}
            />
          </View>
        </Card>
      )}

      {/* ---- Winner → link to contract ---- */}
      {application.status === 'winner' && application.contractId && (
        <Card>
          <View style={styles.winnerInfo}>
            <Ionicons name="trophy" size={24} color={colors.success} />
            <Text style={styles.winnerText}>
              Este aplicante ganó y tiene un contrato creado.
            </Text>
          </View>
          <AppButton
            title="Ver contrato"
            variant="secondary"
            onPress={() =>
              navigation.navigate('ContractDetail', {
                contractId: application.contractId!,
              })
            }
          />
        </Card>
      )}

      {/* ---- Date ---- */}
      <Text style={styles.dateText}>
        Aplicó el{' '}
        {application.createdAt
          ? new Date(application.createdAt).toLocaleDateString('es-DO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '—'}
      </Text>
    </Screen>
  );
}

/* ---- Styles ---- */

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textInverse,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  commentText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
  answerItem: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  answerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  answerValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  savingText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  actionsCol: {
    gap: spacing.sm,
  },
  winnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  winnerText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.disabled,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
