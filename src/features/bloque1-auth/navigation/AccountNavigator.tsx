/**
 * Stack privado del Bloque 1: datos de la cuenta y cambio de clave.
 * Reemplaza al stack público en la pestaña "Cuenta" cuando hay sesión.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import AccountScreen from '../screens/AccountScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import type { AccountStackParamList } from './types';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Mi cuenta' }} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Cambiar clave' }}
      />
    </Stack.Navigator>
  );
}
