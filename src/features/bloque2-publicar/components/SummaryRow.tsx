/**
 * Fila «etiqueta → valor» de los resúmenes (pago y oferta publicada).
 *
 *   <SummaryRow label="Pago" value="RD$1,500 · por el trabajo" mono />
 *   <SummaryRow label="Total" value="US$1.00" strong last />
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/theme';

export interface SummaryRowProps {
  label: string;
  value: string;
  /** Resalta el valor (fila de total). */
  strong?: boolean;
  /** Sin la línea de abajo. */
  last?: boolean;
}

export function SummaryRow({ label, value, strong = false, last = false }: SummaryRowProps) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={[styles.label, strong && styles.labelStrong]}>{label}</Text>
      <Text style={[styles.value, strong && styles.valueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  labelStrong: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  value: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  valueStrong: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
