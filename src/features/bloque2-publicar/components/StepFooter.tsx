/**
 * Pie fijo del asistente: separa el contenido con una regla y sostiene el botón
 * principal, que nunca se va de pantalla aunque el teclado esté abierto.
 *
 *   <StepFooter
 *     label="Continuar"
 *     onPress={siguiente}
 *     disabled={!listo}
 *     hint="Falta la foto"
 *   />
 */

import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components';
import { colors, fontSize, spacing } from '@/theme';
import { FOOTER_HEIGHT } from '../constants';

export interface StepFooterProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Texto pequeño encima del botón: explica por qué está bloqueado. */
  hint?: string;
  /** Botón secundario a la izquierda del principal. */
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export function StepFooter({
  label,
  onPress,
  disabled = false,
  loading = false,
  hint,
  secondaryLabel,
  onSecondaryPress,
}: StepFooterProps) {
  return (
    <View style={styles.footer}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <View style={styles.row}>
        {secondaryLabel && onSecondaryPress ? (
          <AppButton
            title={secondaryLabel}
            onPress={onSecondaryPress}
            variant="secondary"
            fullWidth={false}
            disabled={loading}
            style={styles.secondary}
          />
        ) : null}

        <AppButton
          title={label}
          onPress={onPress}
          disabled={disabled}
          loading={loading}
          fullWidth={false}
          style={styles.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    minHeight: FOOTER_HEIGHT,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
  },
  primary: {
    flex: 2,
  },
});
