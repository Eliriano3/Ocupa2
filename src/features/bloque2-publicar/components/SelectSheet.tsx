/**
 * Campo de selección que abre una hoja desde abajo con la lista de opciones.
 * El spec pide «bottom sheet nativo»; se arma con `<Modal />` para que se vea
 * igual en Android, iOS y web (igual que `<ConfirmDialog />`).
 *
 *   <SelectSheet
 *     label="Tipo de trabajo"
 *     required
 *     placeholder="Elige el tipo de trabajo"
 *     options={jobTypes.map((t) => ({ value: t.key, label: t.name }))}
 *     value={jobTypeKey}
 *     onChange={setJobTypeKey}
 *     error={errors.jobTypeKey}
 *   />
 */

import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '@/theme';
import { FIELD_HEIGHT, TOUCH_TARGET } from '../constants';
import { FieldShell } from './FieldShell';

export interface SelectSheetOption {
  value: string;
  label: string;
  /** Segunda línea en la lista, ej. la descripción del tipo de trabajo. */
  description?: string;
}

export interface SelectSheetProps {
  label: string;
  options: SelectSheetOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  /** Título de la hoja. Por defecto, la etiqueta del campo. */
  sheetTitle?: string;
}

export function SelectSheet({
  label,
  options,
  value,
  onChange,
  placeholder = 'Elige una opción',
  required = false,
  error,
  hint,
  disabled = false,
  sheetTitle,
}: SelectSheetProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const choose = (next: string) => {
    setOpen(false);
    onChange(next);
  };

  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityLabel={`${label}. ${selected ? selected.label : placeholder}`}
        style={[
          styles.field,
          Boolean(error) && styles.fieldError,
          disabled && styles.faded,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, !selected && styles.placeholder]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Frena el toque para que tocar la hoja no la cierre. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{sheetTitle ?? label}</Text>

            <FlatList
              data={options}
              keyExtractor={(option) => option.value}
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.empty}>No hay opciones disponibles.</Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => choose(item.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text style={styles.optionDescription}>{item.description}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </FieldShell>
  );
}

const styles = StyleSheet.create({
  field: {
    height: FIELD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  faded: {
    opacity: 0.6,
  },
  value: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 33, 47, 0.5)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    minHeight: TOUCH_TARGET + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionPressed: {
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  optionDescription: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  empty: {
    padding: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
