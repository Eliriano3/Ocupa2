/**
 * Stack que se muestra cuando hay sesión pero a la cuenta le falta el perfil.
 *
 * Es una sola pantalla y sin pestañas a propósito: el API exige cédula, género
 * y fecha de nacimiento antes de dejar publicar, así que no tiene sentido
 * dejar entrar al resto de la app para chocar con un error después.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import type { ProfileSetupStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileSetupStackParamList>();

export function ProfileSetupNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="CompleteProfile"
        component={CompleteProfileScreen}
        options={{ title: 'Completar perfil' }}
      />
    </Stack.Navigator>
  );
}
