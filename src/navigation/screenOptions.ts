/**
 * Opciones compartidas de los stacks, para que todas las cabeceras se vean
 * igual sin repetir estilos en cada bloque.
 */

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/theme';

export const defaultStackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textInverse,
  headerTitleStyle: { fontWeight: '700' },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.background },
};
