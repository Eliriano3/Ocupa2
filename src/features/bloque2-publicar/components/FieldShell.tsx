/**
 * Marco de un campo que no es un `TextInput`: etiqueta arriba, contenido en el
 * medio y error o ayuda debajo. Repite exactamente la chrome de `<AppInput />`
 * para que un selector, un mapa o una zona de foto se vean como un campo más.
 *
 *   <FieldShell label="Tipo de trabajo" required error={error}>
 *     …lo que sea…
 *   </FieldShell>
 */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontSize, spacing } from '@/theme';

export interface FieldShellProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  /** Ayuda debajo del campo; se oculta cuando hay error. */
  hint?: string;
  /** Texto a la derecha de la etiqueta, ej. el contador «120/600». */
  counter?: string;
  /** Pinta el contador en rojo (cerca del límite). */
  counterWarning?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FieldShell({
  label,
  children,
  required = false,
  error,
  hint,
  counter,
  counterWarning = false,
  style,
}: FieldShellProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {counter ? (
          <Text style={[styles.counter, counterWarning && styles.counterWarning]}>{counter}</Text>
        ) : null}
      </View>

      {children}

      {error ? (
        // TalkBack lee el error en cuanto aparece, sin que el usuario lo busque.
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
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
  counterWarning: {
    color: colors.danger,
    fontWeight: '700',
  },
  error: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
