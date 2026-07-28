/**
 * Navegación del Bloque 3 · Aplicantes y contratos.
 * Responsable: Hanier Peguero · 2024-0012.
 *
 * Este stack se monta en su propia pestaña desde `src/navigation/MainTabs.tsx`.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import MyContractsScreen from '../screens/MyContractsScreen';
import ContractDetailScreen from '../screens/ContractDetailScreen';
import ApplicantsListScreen from '../screens/ApplicantsListScreen';
import ApplicantDetailScreen from '../screens/ApplicantDetailScreen';
import type { ContractsStackParamList } from './types';

const Stack = createNativeStackNavigator<ContractsStackParamList>();

export function ContractsNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="MyContracts"
        component={MyContractsScreen}
        options={{ title: 'Mis contratos' }}
      />
      <Stack.Screen
        name="ContractDetail"
        component={ContractDetailScreen}
        options={{ title: 'Detalle del contrato' }}
      />
      <Stack.Screen
        name="ApplicantsList"
        component={ApplicantsListScreen}
        options={{ title: 'Aplicantes' }}
      />
      <Stack.Screen
        name="ApplicantDetail"
        component={ApplicantDetailScreen}
        options={{ title: 'Detalle del aplicante' }}
      />
    </Stack.Navigator>
  );
}
