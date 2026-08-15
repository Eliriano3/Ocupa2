/**
 * Paso 3 de 4 · Foto y plazo — Bloque 2 · Publicar y pagos.
 * Endpoints: POST /uploads
 *
 * La foto es obligatoria: sin ella `POST /offers` responde 422, así que el
 * botón de continuar queda bloqueado y el error se anuncia con TalkBack.
 * El API guarda la URL pública que devuelve `/uploads`, no el archivo.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppInput, ErrorMessage, Screen, errorToMessage } from '@/components';
import { pickAndUploadImage } from '@/services';
import { colors, fontSize, radius, spacing } from '@/theme';
import { PhotoDropzone, StepFooter, WizardLayout } from '../components';
import { DEADLINE_MAX_DAYS, TOUCH_TARGET } from '../constants';
import { usePublishDraft } from '../state/PublishDraftContext';
import { formatDate, isoDatePlusDays, validateDeadline } from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'OfferPhoto'>;

/** Atajos de fecha, para no obligar a escribir el formato a mano. */
const QUICK_DEADLINES = [
  { days: 3, label: '3 días' },
  { days: 7, label: '1 semana' },
  { days: 15, label: '15 días' },
  { days: 30, label: '30 días' },
];

export default function OfferPhotoScreen() {
  const navigation = useNavigation<Navigation>();
  const { draft, patch } = usePublishDraft();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [deadlineError, setDeadlineError] = useState<string | undefined>();

  async function choosePhoto() {
    setUploading(true);
    setUploadError(null);
    setPhotoError(undefined);

    try {
      const uploaded = await pickAndUploadImage();
      // `null` = el usuario canceló; no es un error.
      if (uploaded) patch({ photo: uploaded.url });
    } catch (caught) {
      setUploadError(caught);
      setPhotoError(errorToMessage(caught));
    } finally {
      setUploading(false);
    }
  }

  const goNext = () => {
    const missingPhoto = draft.photo ? undefined : 'La foto es obligatoria para publicar.';
    const badDeadline = validateDeadline(draft.deadline);

    setPhotoError(missingPhoto);
    setDeadlineError(badDeadline);

    if (missingPhoto || badDeadline) return;
    navigation.navigate('OfferQuestions');
  };

  const ready = Boolean(draft.photo) && !validateDeadline(draft.deadline);

  return (
    <Screen padded={false}>
      <WizardLayout
        step={3}
        footer={
          <StepFooter
            label="Continuar"
            onPress={goNext}
            disabled={!ready}
            hint={ready ? undefined : 'Falta la foto o la fecha límite.'}
          />
        }
      >
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Foto del lugar o la tarea<Text style={styles.required}> *</Text>
          </Text>
          <Text style={styles.counter}>{draft.photo ? '1/1' : '0/1'}</Text>
        </View>

        <PhotoDropzone
          url={draft.photo}
          uploading={uploading}
          error={photoError}
          onPick={() => void choosePhoto()}
          onRemove={() => {
            patch({ photo: null });
            setPhotoError(undefined);
          }}
        />

        {!photoError ? (
          <Text style={styles.help}>
            Las ofertas con foto reciben muchas más aplicaciones. JPG, PNG, WEBP o GIF, máximo 8 MB.
          </Text>
        ) : null}

        {uploadError ? (
          <View style={styles.errorBlock}>
            <ErrorMessage error={uploadError} onRetry={() => void choosePhoto()} />
          </View>
        ) : null}

        <View style={styles.rule} />

        <AppInput
          label="Fecha límite para aplicar"
          required
          value={draft.deadline}
          onChangeText={(deadline) => {
            patch({ deadline });
            setDeadlineError(undefined);
          }}
          placeholder="2026-08-22"
          keyboardType="numbers-and-punctuation"
          error={deadlineError}
          hint={
            draft.deadline && !deadlineError
              ? `Se cierra sola el ${formatDate(draft.deadline)}.`
              : `Formato AAAA-MM-DD. Máximo ${DEADLINE_MAX_DAYS} días.`
          }
        />

        <View style={styles.quickRow}>
          {QUICK_DEADLINES.map((option) => {
            const value = isoDatePlusDays(option.days);
            const selected = draft.deadline === value;

            return (
              <Pressable
                key={option.days}
                onPress={() => {
                  patch({ deadline: value });
                  setDeadlineError(undefined);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Cerrar en ${option.label}`}
                accessibilityState={{ selected }}
                style={[styles.quickChip, selected && styles.quickChipSelected]}
              >
                <Text style={[styles.quickLabel, selected && styles.quickLabelSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </WizardLayout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  required: {
    color: colors.danger,
  },
  counter: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  help: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  errorBlock: {
    marginTop: spacing.md,
  },
  rule: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickChip: {
    minHeight: TOUCH_TARGET - 8,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quickChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  quickLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  quickLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
