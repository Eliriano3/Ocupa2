/**
 * Aviso breve anclado abajo: entra en 250ms, se va solo a los 4 segundos.
 * Se usa para confirmar acciones que no merecen un diálogo («oferta
 * desactivada», «pago aprobado»).
 *
 *   const [aviso, setAviso] = useState<string | null>(null);
 *   …
 *   <Snackbar message={aviso} onHide={() => setAviso(null)} />
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/theme';
import { SNACKBAR_MS } from '../constants';

export interface SnackbarProps {
  /** Texto a mostrar; `null` lo mantiene oculto. */
  message: string | null;
  /** Se llama cuando se va solo o cuando lo tocan. */
  onHide: () => void;
  /** Punto verde en vez del azul, para confirmaciones. */
  tone?: 'info' | 'success';
}

export function Snackbar({ message, onHide, tone = 'success' }: SnackbarProps) {
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.timing(slide, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(onHide, SNACKBAR_MS);
    return () => {
      clearTimeout(timer);
      slide.setValue(0);
    };
  }, [message, onHide, slide]);

  if (!message) return null;

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Animated.View style={[styles.container, { opacity: slide, transform: [{ translateY }] }]}>
      <Pressable
        onPress={onHide}
        accessibilityRole="button"
        accessibilityLabel={`${message}. Tocar para cerrar.`}
        accessibilityLiveRegion="polite"
        style={styles.bar}
      >
        <View style={[styles.dot, tone === 'success' ? styles.dotSuccess : styles.dotInfo]} />
        <Text style={styles.message}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  dotSuccess: {
    backgroundColor: colors.success,
  },
  dotInfo: {
    backgroundColor: colors.accent,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textInverse,
    lineHeight: 20,
  },
});
