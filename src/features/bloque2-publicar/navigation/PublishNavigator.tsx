/**
 * Navegación del Bloque 2 · Publicar y pagos.
 * Responsable: Josue Fondeur Román · 2024-0193.
 *
 * Este stack se monta en su propia pestaña desde `src/navigation/MainTabs.tsx`.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import PublishOfferScreen from '../screens/PublishOfferScreen';
import PaymentScreen from '../screens/PaymentScreen';
import MyPaymentsScreen from '../screens/MyPaymentsScreen';
import MyOffersScreen from '../screens/MyOffersScreen';
import type { PublishStackParamList } from './types';

const Stack = createNativeStackNavigator<PublishStackParamList>();

export function PublishNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="PublishOffer"
        component={PublishOfferScreen}
        options={{ title: 'Publicar oferta' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Pagar publicación' }}
      />
      <Stack.Screen
        name="MyPayments"
        component={MyPaymentsScreen}
        options={{ title: 'Mis pagos' }}
      />
      <Stack.Screen
        name="MyOffers"
        component={MyOffersScreen}
        options={{ title: 'Mis ofertas' }}
      />
    </Stack.Navigator>
  );
}
