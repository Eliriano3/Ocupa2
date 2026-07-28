/**
 * Tarjeta blanca para agrupar contenido (items de lista, bloques de un
 * formulario, secciones de detalle).
 */

import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export interface CardProps {
  children: React.ReactNode;
  /** Si lo pasas, la tarjeta se vuelve tocable. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
});
