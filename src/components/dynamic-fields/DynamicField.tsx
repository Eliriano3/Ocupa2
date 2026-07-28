/**
 * Renderizador de un campo dinámico: recibe la definición y devuelve el input
 * que corresponde a su `type`.
 *
 *   <DynamicField
 *     field={{ key: 'categoria_licencia', label: 'Categoría', type: 'select',
 *              required: true, options: ['01', '02', '03'] }}
 *     value={values.categoria_licencia}
 *     onChange={(value) => setValue('categoria_licencia', value)}
 *     error={errors.categoria_licencia}
 *   />
 *
 * Para un formulario completo usa `<DynamicForm />`, que ya arma los valores,
 * los errores y las validaciones.
 */

import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '@/theme';
import { AppInput } from '../AppInput';
import type { FieldDefinition, FieldValue } from './types';

export interface DynamicFieldProps {
  field: FieldDefinition;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
  /** Bloquea la edición (ej. mientras se envía el formulario). */
  disabled?: boolean;
}

export function DynamicField({ field, value, onChange, error, disabled }: DynamicFieldProps) {
  switch (field.type) {
    case 'text':
      return (
        <AppInput
          label={field.label}
          required={field.required}
          error={error}
          hint={field.hint}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={field.placeholder}
          editable={!disabled}
          multiline
        />
      );

    case 'number':
      return (
        <AppInput
          label={field.label}
          required={field.required}
          error={error}
          hint={field.hint}
          value={value === null || value === undefined ? '' : String(value)}
          onChangeText={onChange}
          placeholder={field.placeholder}
          keyboardType="numeric"
          editable={!disabled}
        />
      );

    case 'date':
      // TODO(compartido): si el equipo agrega @react-native-community/datetimepicker,
      // cambiar este input por el selector nativo manteniendo el formato AAAA-MM-DD.
      return (
        <AppInput
          label={field.label}
          required={field.required}
          error={error}
          hint={field.hint ?? 'Formato: AAAA-MM-DD'}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          placeholder={field.placeholder ?? '2026-08-30'}
          keyboardType="numbers-and-punctuation"
          editable={!disabled}
        />
      );

    case 'select':
      return (
        <SelectField
          field={field}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'check':
      return field.options && field.options.length > 0 ? (
        <MultiCheckField
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      ) : (
        <SwitchField
          field={field}
          value={value === true}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
}

/* ------------------------------- select ------------------------------- */

function SelectField({
  field,
  value,
  onChange,
  error,
  disabled,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: FieldValue) => void;
  error?: string;
  disabled?: boolean;
}) {
  const options = field.options ?? [];

  return (
    <FieldShell label={field.label} required={field.required} error={error} hint={field.hint}>
      {options.length === 0 ? (
        <Text style={styles.noOptions}>Este campo no tiene opciones configuradas.</Text>
      ) : (
        <View style={styles.optionsRow}>
          {options.map((option) => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                disabled={disabled}
                onPress={() => onChange(selected ? '' : option)}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled }}
                style={[styles.chip, selected && styles.chipSelected, disabled && styles.faded]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </FieldShell>
  );
}

/* -------------------------- check con opciones ------------------------- */

function MultiCheckField({
  field,
  value,
  onChange,
  error,
  disabled,
}: {
  field: FieldDefinition;
  value: string[];
  onChange: (value: FieldValue) => void;
  error?: string;
  disabled?: boolean;
}) {
  const toggle = (option: string) => {
    const next = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(next);
  };

  return (
    <FieldShell label={field.label} required={field.required} error={error} hint={field.hint}>
      {(field.options ?? []).map((option) => {
        const checked = value.includes(option);
        return (
          <Pressable
            key={option}
            disabled={disabled}
            onPress={() => toggle(option)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled }}
            style={[styles.checkRow, disabled && styles.faded]}
          >
            <Ionicons
              name={checked ? 'checkbox' : 'square-outline'}
              size={22}
              color={checked ? colors.primary : colors.disabled}
            />
            <Text style={styles.checkLabel}>{option}</Text>
          </Pressable>
        );
      })}
    </FieldShell>
  );
}

/* --------------------------- check booleano --------------------------- */

function SwitchField({
  field,
  value,
  onChange,
  error,
  disabled,
}: {
  field: FieldDefinition;
  value: boolean;
  onChange: (value: FieldValue) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.switchRow}>
        <Text style={styles.label}>
          {field.label}
          {field.required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : field.hint ? (
        <Text style={styles.hint}>{field.hint}</Text>
      ) : null}
    </View>
  );
}

/* ------------------------------- shell -------------------------------- */

function FieldShell({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <Text style={styles.error}>{error}</Text>
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
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  faded: {
    opacity: 0.6,
  },
  noOptions: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
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
