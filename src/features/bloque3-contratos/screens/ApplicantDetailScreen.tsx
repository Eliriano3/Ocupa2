/**
 * Detalle del aplicante — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /offers/{id}/applications, PATCH /applications/{id}
 *
 * Muestra el comentario y las respuestas del aplicante, y permite
 * calificar (1-5), descartar, marcar finalista o elegir ganador.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { AppButton, Card, ConfirmDialog, ErrorMessage, Loader, Screen } from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { ContractsStackParamList } from '../navigation/types';
import { formatDate } from '@/features/bloque2-publicar/utils';

type Nav = NativeStackNavigationProp<ContractsStackParamList, 'ApplicantDetail'>;
type RouteT = RouteProp<ContractsStackParamList, 'ApplicantDetail'>;

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

export default function ApplicantDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { offerId, applicationId } = route.params;

  const [submitting, setSubmitting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [localRating, setLocalRating] = useState<number>(0);

  // Dialog state (replaces Alert.alert)
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ visible: false, title: '', onConfirm: () => { } });

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
      setDialog({
        visible: true,
        title: `¿${label}?`,
        message:
          newStatus === 'winner'
            ? 'Al elegir como ganador se crea un contrato automáticamente. ¿Continuar?'
            : `¿Estás seguro de que quieres ${label.toLowerCase()} a este aplicante?`,
        confirmLabel: 'Confirmar',
        destructive: newStatus === 'discarded',
        onConfirm: async () => {
          setDialog((d) => ({ ...d, visible: false }));
          setActionError(null);
          setSubmitting(newStatus);
          try {
            const updated = await applicationsApi.updateApplication(
              applicationId,
              { status: newStatus },
            );
            await reload();
            if (newStatus === 'winner' && updated.contractId) {
              setDialog({
                visible: true,
                title: '¡Ganador elegido!',
                message: 'Se creó el contrato automáticamente. ¿Quieres verlo?',
                confirmLabel: 'Ver contrato',
                cancelLabel: 'Más tarde',
                onConfirm: () => {
                  setDialog((d) => ({ ...d, visible: false }));
                  navigation.navigate('ContractDetail', {
                    contractId: updated.contractId!,
                  });
                },
                onCancel: () => setDialog((d) => ({ ...d, visible: false })),
              });
            }
          } catch (err) {
            setActionError(err);
          } finally {
            setSubmitting(null);
          }
        },
        onCancel: () => setDialog((d) => ({ ...d, visible: false })),
      });
    },
    [applicationId, reload, navigation],
  );

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

      <Card>
        <Text style={styles.sectionTitle}>Comentario</Text>
        <Text style={styles.commentText}>
          {application.comment || 'Sin comentario.'}
        </Text>
      </Card>

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

      {actionError ? <ErrorMessage error={actionError} /> : null}

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

      <Text style={styles.dateText}>
        Aplicó el {formatDate(application.createdAt)}
      </Text>

      <ConfirmDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        destructive={dialog.destructive}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </Screen>
  );
}

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
