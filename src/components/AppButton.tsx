/**
 * Botón estándar de la app, con estados de carga y deshabilitado.
 *
 *   <AppButton title="Entrar" onPress={submit} loading={sending} />
 */

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontSize, radius, spacing } from '@/theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  /** Muestra un spinner y bloquea el botón. */
  loading?: boolean;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible. Por defecto `true`. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: AppButtonProps) {
  const isBlocked = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        pressed && !isBlocked && styles.pressed,
        isBlocked && styles.blocked,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.primary}
          />
        ) : null}
        <Text style={[styles.label, variantStyles[variant].label]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  blocked: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary },
    label: { color: colors.textInverse },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    label: { color: colors.primary },
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: 'transparent' },
    label: { color: colors.primary },
  }),
  danger: StyleSheet.create({
    container: { backgroundColor: colors.danger },
    label: { color: colors.textInverse },
  }),
} as const;
