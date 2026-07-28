/**
 * Estado vacío: "todavía no hay nada aquí", con una acción opcional.
 *
 *   <EmptyState
 *     title="Aún no has aplicado a ninguna oferta"
 *     message="Explora las ofertas disponibles y aplica a la que te interese."
 *     actionLabel="Explorar ofertas"
 *     onAction={goToExplore}
 *   />
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, spacing } from '@/theme';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  title: string;
  message?: string;
  /** Nombre de un ícono de Ionicons. Por defecto un documento vacío. */
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.disabled} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: spacing.md,
  },
});
