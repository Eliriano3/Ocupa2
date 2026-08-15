/**
 * Esqueleto de las pantallas con formulario del bloque: barra de progreso
 * arriba, contenido con scroll en el medio y pie fijo abajo.
 *
 * Además resuelve el teclado: encoge todo por el alto del teclado, así el pie
 * queda anclado justo encima y el campo enfocado nunca se esconde detrás.
 * Ver `hooks/useKeyboardInset.ts` para el porqué.
 *
 *   <WizardLayout step={1} footer={<StepFooter … />}>
 *     …campos…
 *   </WizardLayout>
 */

import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { StepProgress } from './StepProgress';

export interface WizardLayoutProps {
  children: React.ReactNode;
  /** Pie fijo, normalmente un `<StepFooter />`. */
  footer: React.ReactNode;
  /** Paso del asistente. Sin él no se pinta la barra de progreso. */
  step?: number;
}

export function WizardLayout({ children, footer, step }: WizardLayoutProps) {
  const keyboardInset = useKeyboardInset();

  return (
    <View style={[styles.container, { marginBottom: keyboardInset }]}>
      {step !== undefined ? <StepProgress step={step} /> : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        // En iOS el scroll se aparta solo del teclado; en Android lo resuelve
        // el margen de arriba.
        automaticallyAdjustKeyboardInsets
      >
        {children}
      </ScrollView>

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
