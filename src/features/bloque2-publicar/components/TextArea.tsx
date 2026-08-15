/**
 * Área de texto de varias líneas con contador vivo.
 *
 * `<AppInput />` no expone `style` (lo omite de `TextInputProps` a propósito),
 * así que el campo de 110dp con el contador arriba que pide el spec se arma
 * aquí, reusando el mismo marco de `<FieldShell />` para que se vea idéntico al
 * resto de los campos de la app.
 *
 *   <TextArea
 *     label="Descripción"
 *     required
 *     value={description}
 *     onChangeText={setDescription}
 *     maxLength={600}
 *     error={error}
 *   />
 */

import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/theme';
import { FieldShell } from './FieldShell';

export interface TextAreaProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  maxLength?: number;
  /** A partir de aquí el contador se pinta en rojo. */
  warnAt?: number;
  height?: number;
  editable?: boolean;
}

export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  hint,
  maxLength,
  warnAt,
  height = 110,
  editable = true,
}: TextAreaProps) {
  const [focused, setFocused] = useState(false);
  const length = value.length;
  const nearLimit = warnAt !== undefined && length >= warnAt;

  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      hint={hint}
      counter={maxLength ? `${length}/${maxLength}` : undefined}
      counterWarning={nearLimit}
    >
      <View
        style={[
          styles.field,
          { height },
          focused && styles.fieldFocused,
          Boolean(error) && styles.fieldError,
          !editable && styles.faded,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          maxLength={maxLength}
          editable={editable}
          multiline
          textAlignVertical="top"
        />
      </View>
    </FieldShell>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // El estado «focused» del spec: borde de 2dp en el color primario.
  fieldFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  fieldError: {
    borderWidth: 2,
    borderColor: colors.danger,
  },
  faded: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.text,
  },
});
