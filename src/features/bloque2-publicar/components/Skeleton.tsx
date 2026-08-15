/**
 * Esqueletos de carga para las listas del bloque.
 *
 * El spec es explícito: en «Mis ofertas» y «Mis pagos» se muestran esqueletos,
 * y la lista vacía muestra el estado vacío — nunca un spinner infinito.
 *
 *   {loading ? <SkeletonList rows={3} /> : …}
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { SHIMMER_MS } from '../constants';

/** Una barra gris que late. */
export function SkeletonBar({
  width = '100%',
  height = 12,
  delay = 0,
}: {
  width?: DimensionValue;
  height?: number;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: SHIMMER_MS / 2,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: SHIMMER_MS / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity, delay]);

  return <Animated.View style={[styles.bar, { width, height, opacity }]} />;
}

/** Filas de esqueleto con la forma de una tarjeta de la lista. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <View accessibilityLabel="Cargando" accessibilityRole="progressbar">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={[styles.row, index === rows - 1 && styles.rowLast]}>
          <SkeletonBar width={88} height={10} />
          <SkeletonBar width="70%" height={16} delay={150} />
          <SkeletonBar width="45%" height={12} delay={300} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.border,
    borderRadius: radius.sm,
  },
  row: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
});
