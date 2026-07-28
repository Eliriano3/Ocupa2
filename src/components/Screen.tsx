/**
 * Contenedor de pantalla: área segura, fondo de la app, padding y, si hace
 * falta, scroll que se aparta del teclado.
 *
 *   <Screen scroll>
 *     …contenido…
 *   </Screen>
 */

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  /** Envuelve el contenido en un `ScrollView`. */
  scroll?: boolean;
  /** Padding lateral estándar. Por defecto `true`. */
  padded?: boolean;
  /** Bordes seguros a respetar. Por defecto solo los laterales y el inferior. */
  edges?: readonly Edge[];
  /** `<RefreshControl />` para "deslizar para actualizar" (requiere `scroll`). */
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['left', 'right', 'bottom'],
  refreshControl,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const padding = padded ? styles.padded : null;

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, padding, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, padding, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },
});
