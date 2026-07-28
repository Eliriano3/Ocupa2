/**
 * Mensaje de error reutilizable.
 *
 * Acepta un texto o directamente el error atrapado en el `catch`: si es un
 * `ApiError` ya trae el mensaje en español que devolvió el cliente HTTP.
 *
 *   <ErrorMessage error={error} onRetry={cargar} />
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ApiError } from '@/api';
import { colors, fontSize, radius, spacing } from '@/theme';
import { AppButton } from './AppButton';

export interface ErrorMessageProps {
  /** Texto, `Error`, `ApiError` o `null` (no pinta nada). */
  error: unknown;
  /** Muestra un botón "Reintentar". */
  onRetry?: () => void;
  /** Centra el bloque en toda la pantalla, para listas que fallaron al cargar. */
  fullScreen?: boolean;
}

/** Convierte cualquier error en un texto legible. */
export function errorToMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

export function ErrorMessage({ error, onRetry, fullScreen = false }: ErrorMessageProps) {
  if (!error) return null;

  const message = errorToMessage(error);
  const isOffline = error instanceof ApiError && error.isOffline;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.row}>
        <Ionicons
          name={isOffline ? 'cloud-offline-outline' : 'alert-circle-outline'}
          size={20}
          color={colors.danger}
        />
        <Text style={styles.message}>{message}</Text>
      </View>

      {onRetry ? (
        <AppButton
          title="Reintentar"
          onPress={onRetry}
          variant="secondary"
          fullWidth={false}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    margin: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.danger,
    lineHeight: 20,
  },
  retry: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
});
