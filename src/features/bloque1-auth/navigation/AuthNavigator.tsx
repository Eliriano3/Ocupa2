/**
 * Stack público del Bloque 1: login, registro y recuperar clave.
 * Se muestra en la pestaña "Cuenta" mientras no haya sesión.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Iniciar sesión', headerShown: false }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Olvidé mi clave' }}
      />
    </Stack.Navigator>
  );
}
