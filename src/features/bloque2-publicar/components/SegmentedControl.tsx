/**
 * Selector segmentado: dos o cuatro opciones excluyentes en una sola fila.
 * Lo usa el tipo de contrato (paso 1) y el tipo de pregunta (paso 4).
 *
 *   <SegmentedControl
 *     options={[{ value: 'temporal', label: 'Temporal' }, …]}
 *     value={contractType}
 *     onChange={setContractType}
 *   />
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/theme';
import { TOUCH_TARGET } from '../constants';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Más bajo, para el selector de tipo de pregunta dentro de una tarjeta. */
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.group, disabled && styles.faded]}>
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={option.label}
            style={[
              styles.segment,
              compact ? styles.segmentCompact : styles.segmentRegular,
              index > 0 && styles.divided,
              selected && styles.segmentSelected,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                compact && styles.labelCompact,
                selected && styles.labelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  segmentRegular: {
    height: TOUCH_TARGET,
  },
  segmentCompact: {
    height: 40,
  },
  divided: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  labelCompact: {
    fontSize: fontSize.xs,
  },
  labelSelected: {
    color: colors.textInverse,
  },
  faded: {
    opacity: 0.6,
  },
});
