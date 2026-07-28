/**
 * Indicador de carga. Por defecto ocupa toda la pantalla; con `inline`
 * se comporta como un bloque más dentro del contenido.
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/theme';

export interface LoaderProps {
  /** Texto opcional debajo del spinner. */
  message?: string;
  /** `true` para no centrarlo en toda la pantalla. */
  inline?: boolean;
}

export function Loader({ message, inline = false }: LoaderProps) {
  return (
    <View style={[styles.container, inline ? styles.inline : styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fullScreen: {
    flex: 1,
    padding: spacing.lg,
  },
  inline: {
    paddingVertical: spacing.lg,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
