/**
 * Input de formulario con etiqueta, mensaje de error y ojo para ver la clave.
 * Es el input estándar de la app: úsalo en vez de `TextInput` pelado.
 */

import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, fontSize, radius, spacing } from '@/theme';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Mensaje de error; pinta el borde en rojo cuando viene con texto. */
  error?: string;
  /** Texto de ayuda debajo del campo (se oculta si hay error). */
  hint?: string;
  /** Muestra el botón "Ver / Ocultar" y oculta el texto. */
  isPassword?: boolean;
  required?: boolean;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, error, hint, isPassword = false, required = false, ...inputProps },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <View style={[styles.field, hasError && styles.fieldError]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !visible}
          autoCapitalize={isPassword ? 'none' : inputProps.autoCapitalize}
          {...inputProps}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setVisible((current) => !current)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar clave' : 'Ver clave'}
          >
            <Text style={styles.toggle}>{visible ? 'Ocultar' : 'Ver'}</Text>
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    fontSize: fontSize.md,
    color: colors.text,
  },
  toggle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    paddingLeft: spacing.sm,
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
