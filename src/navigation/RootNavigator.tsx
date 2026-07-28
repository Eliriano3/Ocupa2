/**
 * Navegador raíz.
 *
 * Mientras se restaura la sesión guardada muestra el loader; después decide
 * qué menú montar según haya sesión o no.
 */

import { NavigationContainer, type Theme } from '@react-navigation/native';

import { Loader } from '@/components';
import { useAuth } from '@/store';
import { colors } from '@/theme';
import { GuestTabs, MainTabs } from './MainTabs';

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <Loader message="Cargando Ocupa2…" />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'authenticated' ? <MainTabs /> : <GuestTabs />}
    </NavigationContainer>
  );
}
