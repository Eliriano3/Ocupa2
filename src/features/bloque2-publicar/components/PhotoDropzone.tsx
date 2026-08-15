/**
 * Zona para agregar la foto de la oferta. Cubre los cuatro estados del spec:
 * vacía, subiendo, con foto y con error.
 *
 * La foto es obligatoria para `POST /offers`: sin ella el API responde 422.
 *
 *   <PhotoDropzone
 *     url={photo}
 *     uploading={subiendo}
 *     error={photoError}
 *     onPick={elegirFoto}
 *     onRemove={() => setPhoto(null)}
 *   />
 */

import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '@/theme';
import { DROPZONE_HEIGHT, TOUCH_TARGET } from '../constants';

export interface PhotoDropzoneProps {
  /** URL pública de `POST /uploads`, o `null` si todavía no hay foto. */
  url: string | null;
  onPick: () => void;
  onRemove: () => void;
  uploading?: boolean;
  error?: string;
}

export function PhotoDropzone({
  url,
  onPick,
  onRemove,
  uploading = false,
  error,
}: PhotoDropzoneProps) {
  /* ------------------------------ Subiendo ------------------------------ */
  if (uploading) {
    return (
      <View style={[styles.zone, styles.zoneBusy]} accessibilityLabel="Subiendo la foto">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.busyLabel}>Subiendo la foto…</Text>
      </View>
    );
  }

  /* ------------------------------ Con foto ------------------------------ */
  if (url) {
    return (
      <View>
        <View style={styles.preview}>
          <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Quitar la foto"
            style={styles.remove}
          >
            <Ionicons name="close" size={20} color={colors.textInverse} />
          </Pressable>
        </View>

        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.doneLabel}>Foto lista.</Text>
          <Pressable
            onPress={onPick}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cambiar la foto"
          >
            <Text style={styles.change}>Cambiar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  /* -------------------------- Vacía (con o sin error) -------------------------- */
  const hasError = Boolean(error);

  return (
    <View>
      <Pressable
        onPress={onPick}
        accessibilityRole="button"
        accessibilityLabel="Agregar foto. Cámara o galería."
        style={({ pressed }) => [
          styles.zone,
          hasError && styles.zoneError,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="camera-outline"
          size={30}
          color={hasError ? colors.danger : colors.primary}
        />
        <Text style={[styles.title, hasError && styles.titleError]}>Agregar foto</Text>
        <Text style={[styles.help, hasError && styles.helpError]}>
          Cámara o galería · JPG/PNG · máx. 8 MB
        </Text>
      </Pressable>

      {hasError ? (
        <View style={styles.errorRow} accessibilityLiveRegion="assertive">
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.errorLabel}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    height: DROPZONE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  zoneError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  zoneBusy: {
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  titleError: {
    color: colors.danger,
  },
  help: {
    fontSize: fontSize.xs,
    color: colors.primaryDark,
  },
  helpError: {
    color: colors.danger,
  },
  busyLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  preview: {
    height: DROPZONE_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  remove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: TOUCH_TARGET - 8,
    height: TOUCH_TARGET - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(18, 33, 47, 0.65)',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  doneLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  change: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.danger,
    lineHeight: 18,
  },
});
