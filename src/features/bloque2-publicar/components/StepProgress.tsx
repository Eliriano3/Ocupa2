/**
 * Barra de progreso del asistente de publicación (4dp, como pide el spec).
 * Se anima en 200ms al cambiar de paso.
 *
 *   <StepProgress step={2} total={4} />
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/theme';
import { PROGRESS_HEIGHT, TOTAL_STEPS } from '../constants';

export interface StepProgressProps {
  /** Paso actual, empezando en 1. */
  step: number;
  total?: number;
}

export function StepProgress({ step, total = TOTAL_STEPS }: StepProgressProps) {
  const ratio = Math.max(0, Math.min(1, step / total));
  const width = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: ratio,
      duration: 200,
      easing: Easing.out(Easing.ease),
      // El ancho no se puede animar en el hilo nativo.
      useNativeDriver: false,
    }).start();
  }, [ratio, width]);

  const percent = width.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: step }}
      accessibilityLabel={`Paso ${step} de ${total}`}
    >
      <Animated.View style={[styles.fill, { width: percent }]} />
    </View>
  );
}

/**
 * Contador «2/4» para la derecha de la cabecera del stack.
 *
 *   options={{ headerRight: () => <StepCounter step={2} /> }}
 */
export function StepCounter({ step, total = TOTAL_STEPS }: StepProgressProps) {
  return (
    <Text style={styles.counter} accessibilityLabel={`Paso ${step} de ${total}`}>
      {step}/{total}
    </Text>
  );
}

const styles = StyleSheet.create({
  track: {
    height: PROGRESS_HEIGHT,
    backgroundColor: colors.border,
  },
  fill: {
    height: PROGRESS_HEIGHT,
    backgroundColor: colors.primary,
  },
  counter: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
