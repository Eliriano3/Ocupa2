/**
 * Detalle del contrato — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /contracts/{id}, PUT /contracts/{id}/terms,
 * POST /contracts/{id}/accept, POST /contracts/{id}/reject,
 * POST /contracts/{id}/comments, POST /contracts/{id}/photos,
 * POST /contracts/{id}/cancel
 *
 * Detalle del contrato con términos, comentarios y fotos,
 * y las acciones según el rol (contratante / contratado) y estado.
 */

import { useCallback, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { contractsApi } from '@/api';
import type { Contract } from '@/api';
import {
  AppButton,
  AppInput,
  Card,
  ConfirmDialog,
  ErrorMessage,
  Loader,
  Screen,
} from '@/components';
import { useAsyncData } from '@/hooks';
import { pickAndUploadImage } from '@/services';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { ContractsStackParamList } from '../navigation/types';

type RouteT = RouteProp<ContractsStackParamList, 'ContractDetail'>;

function statusColor(status?: string): string {
  switch (status) {
    case 'active':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'rejected':
    case 'cancelled':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

function statusLabel(status?: string): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status ?? '—';
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function ContractDetailScreen() {
  const route = useRoute<RouteT>();
  const { contractId } = route.params;

  const { data: contract, loading, error, reload, refreshing, refresh } =
    useAsyncData(
      () => contractsApi.getContract(contractId),
      [contractId],
    );
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  // Terms form
  const [showTermsForm, setShowTermsForm] = useState(false);
  const [termsSalary, setTermsSalary] = useState('');
  const [termsCurrency, setTermsCurrency] = useState('USD');
  const [termsStartDate, setTermsStartDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [termsDuration, setTermsDuration] = useState('');

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setTermsStartDate(selectedDate);
  };

  /** Formats a Date as YYYY-MM-DD in UTC (what the API expects). */
  const toISODateString = (d: Date | null): string => {
    if (!d) return '';
    return d.toISOString().split('T')[0];
  };

  // Comment form
  const [commentBody, setCommentBody] = useState('');

  // Photo form
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoDesc, setPhotoDesc] = useState('');

  // Cancel form
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelJustification, setCancelJustification] = useState('');

  // Dialog state (replaces Alert.alert)
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ visible: false, title: '', onConfirm: () => {} });

  const showAlert = (title: string, message: string) =>
    setDialog({ visible: true, title, message, confirmLabel: 'Entendido', onConfirm: () => setDialog((d) => ({ ...d, visible: false })) });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    opts?: { confirmLabel?: string; destructive?: boolean },
  ) =>
    setDialog({
      visible: true,
      title,
      message,
      confirmLabel: opts?.confirmLabel ?? 'Confirmar',
      destructive: opts?.destructive,
      onConfirm: () => { setDialog((d) => ({ ...d, visible: false })); onConfirm(); },
      onCancel: () => setDialog((d) => ({ ...d, visible: false })),
    });
  const isContratante = contract?.myRole === 'contratante';
  const isContratado = contract?.myRole === 'contratado';
  const isPending = contract?.status === 'pending';
  const isActive = contract?.status === 'active';
  const hasTerms =
    contract?.salary != null && contract?.startDate != null;

  const canSetTerms = isContratante && isPending;
  const canAccept = isContratado && isPending && hasTerms;
  const canReject = isContratado && isPending;
  const canComment = isActive;
  const canAddPhoto = isActive;
  const canCancel = isActive;
  const runAction = useCallback(
    async (key: string, action: () => Promise<void>) => {
      setActionError(null);
      setSubmitting(key);
      try {
        await action();
        await reload();
      } catch (err) {
        setActionError(err);
      } finally {
        setSubmitting(null);
      }
    },
    [reload],
  );
  const handleSetTerms = () => {
    const salary = parseFloat(termsSalary);
    if (isNaN(salary) || salary <= 0) {
      showAlert('Error', 'Ingresa un salario válido.');
      return;
    }
    if (!termsStartDate) {
      showAlert('Error', 'Selecciona una fecha de inicio.');
      return;
    }
    if (!termsDuration.trim()) {
      showAlert('Error', 'La duración es requerida.');
      return;
    }
    const startDateStr = toISODateString(termsStartDate);
    runAction('terms', async () => {
      await contractsApi.setContractTerms(contractId, {
        salary,
        currency: termsCurrency || 'USD',
        startDate: startDateStr,
        duration: termsDuration.trim(),
      });
      setShowTermsForm(false);
      setTermsSalary('');
      setTermsStartDate(null);
      setTermsDuration('');
    });
  };
  const handleAccept = () => {
    showConfirm(
      'Aceptar contrato',
      '¿Estás seguro de que quieres aceptar este contrato con los términos definidos?',
      () => runAction('accept', async () => {
        await contractsApi.acceptContract(contractId);
      }),
      { confirmLabel: 'Aceptar' },
    );
  };

  const handleReject = () => {
    showConfirm(
      'Rechazar contrato',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      () => runAction('reject', async () => {
        await contractsApi.rejectContract(contractId);
      }),
      { confirmLabel: 'Rechazar', destructive: true },
    );
  };
  const handleComment = () => {
    if (!commentBody.trim()) return;
    runAction('comment', async () => {
      await contractsApi.createContractComment(contractId, {
        body: commentBody.trim(),
      });
      setCommentBody('');
    });
  };
  const handlePickPhoto = async () => {
    try {
      const result = await pickAndUploadImage();
      if (result?.url) {
        setPhotoUrl(result.url);
      }
    } catch (err) {
      setActionError(err);
    }
  };

  const handleSubmitPhoto = () => {
    if (!photoUrl || !photoDesc.trim()) {
      showAlert('Error', 'Agrega una descripción para la foto.');
      return;
    }
    runAction('photo', async () => {
      await contractsApi.addContractPhoto(contractId, {
        photo: photoUrl!,
        description: photoDesc.trim(),
      });
      setPhotoUrl(null);
      setPhotoDesc('');
    });
  };
  const handleCancel = () => {
    if (!cancelJustification.trim()) {
      showAlert('Error', 'La justificación es requerida para cancelar.');
      return;
    }
    showConfirm(
      'Cancelar contrato',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      () => runAction('cancel', async () => {
        await contractsApi.cancelContract(contractId, {
          justification: cancelJustification.trim(),
        });
        setShowCancelForm(false);
        setCancelJustification('');
      }),
      { confirmLabel: 'Cancelar contrato', destructive: true },
    );
  };

  if (loading) return <Loader message="Cargando contrato…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} fullScreen />;
  if (!contract) {
    return <ErrorMessage error="Contrato no encontrado." fullScreen />;
  }

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
      <View style={styles.statusHeader}>
        <Text style={styles.jobType}>
          {contract.jobTypeName ?? 'Contrato'}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor(contract.status) },
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {statusLabel(contract.status)}
          </Text>
        </View>
        <Text style={styles.dateSubtitle}>
          Creado el {formatDate(contract.createdAt)}
        </Text>
        {contract.acceptedAt && (
          <Text style={styles.dateSubtitle}>
            Aceptado el {formatDate(contract.acceptedAt)}
          </Text>
        )}
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Partes del contrato</Text>

        <View style={styles.partyRow}>
          <Ionicons
            name="briefcase-outline"
            size={20}
            color={colors.primary}
          />
          <View style={styles.partyInfo}>
            <Text style={styles.partyRole}>CONTRATANTE</Text>
            <Text style={styles.partyName}>
              {contract.contratante?.nombre ?? '—'}
            </Text>
            {contract.contratante?.email && (
              <Text style={styles.partyEmail}>
                {contract.contratante.email}
              </Text>
            )}
          </View>
          {isContratante && (
            <View style={styles.youPill}>
              <Text style={styles.youText}>Tú</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.partyRow}>
          <Ionicons name="person-outline" size={20} color={colors.success} />
          <View style={styles.partyInfo}>
            <Text style={styles.partyRole}>CONTRATADO</Text>
            <Text style={styles.partyName}>
              {contract.contratado?.nombre ?? '—'}
            </Text>
            {contract.contratado?.email && (
              <Text style={styles.partyEmail}>
                {contract.contratado.email}
              </Text>
            )}
          </View>
          {isContratado && (
            <View style={styles.youPill}>
              <Text style={styles.youText}>Tú</Text>
            </View>
          )}
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Términos</Text>

        {hasTerms ? (
          <View style={styles.termsGrid}>
            <View style={styles.termItem}>
              <Ionicons name="cash-outline" size={16} color={colors.accent} />
              <Text style={styles.termLabel}>Salario</Text>
              <Text style={styles.termValue}>
                {contract.currency ?? 'USD'}{' '}
                {contract.salary?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.termLabel}>Inicio</Text>
              <Text style={styles.termValue}>
                {formatDate(contract.startDate)}
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="time-outline" size={16} color={colors.accent} />
              <Text style={styles.termLabel}>Duración</Text>
              <Text style={styles.termValue}>
                {contract.duration ?? '—'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noTerms}>
            {canSetTerms
              ? 'Aún no has fijado los términos del contrato.'
              : 'El contratante aún no ha fijado los términos.'}
          </Text>
        )}
        {canSetTerms && !showTermsForm && (
          <AppButton
            title={hasTerms ? 'Modificar términos' : 'Fijar términos'}
            variant="secondary"
            onPress={() => setShowTermsForm(true)}
            style={styles.topGap}
          />
        )}

        {canSetTerms && showTermsForm && (
          <View style={styles.formSection}>
            <AppInput
              label="Salario"
              placeholder="Ej: 1500"
              keyboardType="numeric"
              value={termsSalary}
              onChangeText={setTermsSalary}
              required
            />
            <View>
              <Text style={styles.fieldLabel}>Moneda</Text>
              <View style={styles.currencyRow}>
                {(['USD', 'DOP'] as const).map((cur) => (
                  <Pressable
                    key={cur}
                    style={[
                      styles.currencyOption,
                      termsCurrency === cur && styles.currencyOptionActive,
                    ]}
                    onPress={() => setTermsCurrency(cur)}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        termsCurrency === cur && styles.currencyTextActive,
                      ]}
                    >
                      {cur === 'USD' ? '🇺🇸 USD' : '🇩🇴 DOP'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text style={styles.fieldLabel}>Fecha de inicio *</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text
                  style={[
                    styles.dateButtonText,
                    !termsStartDate && styles.dateButtonPlaceholder,
                  ]}
                >
                  {termsStartDate
                    ? termsStartDate.toLocaleDateString('es-DO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })
                    : 'Seleccionar fecha'}
                </Text>
              </Pressable>
              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={termsStartDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  minimumDate={new Date()}
                  // @ts-expect-error React Native Community types are outdated for onValueChange
                  onValueChange={(e: any, selectedDate: Date) => handleDateChange(e, selectedDate)}
                  onDismiss={() => setShowDatePicker(false)}
                />
              )}
              {Platform.OS === 'web' && (
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={termsStartDate ? toISODateString(termsStartDate) : ''}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val) {
                      const [y, m, d] = val.split('-').map(Number);
                      setTermsStartDate(new Date(Date.UTC(y, m - 1, d)));
                    }
                  }}
                  style={{
                    fontSize: 16,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    marginTop: 4,
                    width: '100%',
                  }}
                />
              )}
            </View>
            <AppInput
              label="Duración"
              placeholder="Ej: 3 meses"
              value={termsDuration}
              onChangeText={setTermsDuration}
              required
            />
            <View style={styles.formButtons}>
              <AppButton
                title="Guardar términos"
                onPress={handleSetTerms}
                loading={submitting === 'terms'}
                disabled={submitting !== null}
              />
              <AppButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setShowTermsForm(false)}
                disabled={submitting !== null}
              />
            </View>
          </View>
        )}
      </Card>
      {isPending && (canAccept || canReject) && (
        <Card>
          <Text style={styles.sectionTitle}>Acciones</Text>

          {!hasTerms && isContratado && (
            <View style={styles.warningBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.warning}
              />
              <Text style={styles.warningText}>
                No puedes aceptar hasta que el contratante fije los términos.
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            {canAccept && (
              <AppButton
                title="Aceptar contrato"
                onPress={handleAccept}
                loading={submitting === 'accept'}
                disabled={submitting !== null}
                style={styles.flex1}
              />
            )}
            {canReject && (
              <AppButton
                title="Rechazar"
                variant="danger"
                onPress={handleReject}
                loading={submitting === 'reject'}
                disabled={submitting !== null}
                style={styles.flex1}
              />
            )}
          </View>
        </Card>
      )}
      {actionError ? <ErrorMessage error={actionError} /> : null}
      <Card>
        <Text style={styles.sectionTitle}>
          Comentarios
          {contract.comments?.length
            ? ` (${contract.comments.length})`
            : ''}
        </Text>

        {contract.comments && contract.comments.length > 0 ? (
          contract.comments.map((c, i) => (
            <View key={i} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>
                  {c.by?.nombre ?? '—'}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(c.createdAt)}
                </Text>
              </View>
              <Text style={styles.commentBody}>{c.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Sin comentarios aún.</Text>
        )}

        {canComment && (
          <View style={styles.commentForm}>
            <AppInput
              placeholder="Escribe un comentario…"
              value={commentBody}
              onChangeText={setCommentBody}
              multiline
              numberOfLines={3}
            />
            <AppButton
              title="Comentar"
              variant="secondary"
              onPress={handleComment}
              loading={submitting === 'comment'}
              disabled={submitting !== null || !commentBody.trim()}
            />
          </View>
        )}
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>
          Fotos
          {contract.photos?.length ? ` (${contract.photos.length})` : ''}
        </Text>

        {contract.photos && contract.photos.length > 0 ? (
          contract.photos.map((p, i) => (
            <View key={i} style={styles.photoItem}>
              {p.url && (
                <Image
                  source={{ uri: p.url }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.photoDesc}>{p.description}</Text>
              <View style={styles.photoMeta}>
                <Text style={styles.photoAuthor}>
                  {p.by?.nombre ?? '—'}
                </Text>
                <Text style={styles.photoDate}>
                  {formatDate(p.createdAt)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Sin fotos aún.</Text>
        )}

        {canAddPhoto && !photoUrl && (
          <AppButton
            title="Agregar foto"
            variant="secondary"
            onPress={handlePickPhoto}
            style={styles.topGap}
          />
        )}

        {canAddPhoto && photoUrl && (
          <View style={styles.photoForm}>
            <Image
              source={{ uri: photoUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <AppInput
              label="Descripción de la foto"
              placeholder="Describe la foto…"
              value={photoDesc}
              onChangeText={setPhotoDesc}
              required
            />
            <View style={styles.formButtons}>
              <AppButton
                title="Subir foto"
                onPress={handleSubmitPhoto}
                loading={submitting === 'photo'}
                disabled={submitting !== null}
              />
              <AppButton
                title="Cancelar"
                variant="ghost"
                onPress={() => {
                  setPhotoUrl(null);
                  setPhotoDesc('');
                }}
                disabled={submitting !== null}
              />
            </View>
          </View>
        )}
      </Card>
      {contract.status === 'cancelled' && (
        <Card>
          <View style={styles.cancelInfo}>
            <Ionicons name="close-circle" size={24} color={colors.danger} />
            <Text style={styles.cancelTitle}>Contrato cancelado</Text>
          </View>
          {contract.cancelledBy && (
            <Text style={styles.cancelMeta}>
              Por: {contract.cancelledBy.nombre}
            </Text>
          )}
          {contract.cancelledAt && (
            <Text style={styles.cancelMeta}>
              Fecha: {formatDate(contract.cancelledAt)}
            </Text>
          )}
          {contract.cancelJustification && (
            <View style={styles.justificationBox}>
              <Text style={styles.justificationLabel}>Justificación:</Text>
              <Text style={styles.justificationText}>
                {contract.cancelJustification}
              </Text>
            </View>
          )}
        </Card>
      )}
      {canCancel && !showCancelForm && (
        <AppButton
          title="Cancelar contrato"
          variant="danger"
          onPress={() => setShowCancelForm(true)}
          style={styles.topGap}
        />
      )}

      {canCancel && showCancelForm && (
        <Card>
          <Text style={styles.sectionTitle}>Cancelar contrato</Text>
          <View style={styles.warningBox}>
            <Ionicons
              name="warning-outline"
              size={18}
              color={colors.danger}
            />
            <Text style={styles.dangerText}>
              Esta acción no se puede deshacer. El contrato quedará cancelado
              para ambas partes.
            </Text>
          </View>
          <AppInput
            label="Justificación"
            placeholder="Explica por qué cancelas el contrato…"
            value={cancelJustification}
            onChangeText={setCancelJustification}
            multiline
            numberOfLines={3}
            required
          />
          <View style={styles.formButtons}>
            <AppButton
              title="Confirmar cancelación"
              variant="danger"
              onPress={handleCancel}
              loading={submitting === 'cancel'}
              disabled={submitting !== null}
            />
            <AppButton
              title="Volver"
              variant="ghost"
              onPress={() => {
                setShowCancelForm(false);
                setCancelJustification('');
              }}
              disabled={submitting !== null}
            />
          </View>
        </Card>
      )}

      <View style={styles.bottomSpacer} />

      <ConfirmDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        destructive={dialog.destructive}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  /* Status header */
  statusHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  jobType: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textInverse,
  },
  dateSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  /* Shared */
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  topGap: {
    marginTop: spacing.md,
  },

  /* Parties */
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  partyInfo: {
    flex: 1,
  },
  partyRole: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  partyName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  partyEmail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  youPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  youText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  /* Terms */
  termsGrid: {
    gap: spacing.sm,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  termLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 70,
  },
  termValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  noTerms: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  /* Actions */
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    flex: 1,
    lineHeight: 20,
  },
  dangerText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    flex: 1,
    lineHeight: 20,
  },

  /* Forms */
  formSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  formButtons: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  dateButtonPlaceholder: {
    color: colors.disabled,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  currencyOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  currencyTextActive: {
    color: colors.textInverse,
  },

  /* Comments */
  commentItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  commentDate: {
    fontSize: fontSize.xs,
    color: colors.disabled,
  },
  commentBody: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  commentForm: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  /* Photos */
  photoItem: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoImage: {
    width: '100%',
    height: 200,
  },
  photoDesc: {
    fontSize: fontSize.sm,
    color: colors.text,
    padding: spacing.sm,
  },
  photoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  photoAuthor: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  photoDate: {
    fontSize: fontSize.xs,
    color: colors.disabled,
  },
  photoForm: {
    marginTop: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },

  /* Cancel info */
  cancelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cancelTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.danger,
  },
  cancelMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  justificationBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  justificationLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 4,
  },
  justificationText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});


