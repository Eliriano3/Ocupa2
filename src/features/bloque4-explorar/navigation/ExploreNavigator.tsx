/**
 * Navegación del Bloque 4 · Explorar, aplicar y me gusta.
 * Responsable: Rosmeris Jimenez De La Cruz · 2024-1779.
 *
 * Este stack se monta en su propia pestaña desde `src/navigation/MainTabs.tsx`.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import ExploreOffersScreen from '../screens/ExploreOffersScreen';
import OffersMapScreen from '../screens/OffersMapScreen';
import OfferDetailScreen from '../screens/OfferDetailScreen';
import ApplyToOfferScreen from '../screens/ApplyToOfferScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import MyLikesScreen from '../screens/MyLikesScreen';
import type { ExploreStackParamList } from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="ExploreOffers"
        component={ExploreOffersScreen}
        options={{ title: 'Explorar ofertas' }}
      />
      <Stack.Screen
        name="OffersMap"
        component={OffersMapScreen}
        options={{ title: 'Mapa' }}
      />
      <Stack.Screen
        name="OfferDetail"
        component={OfferDetailScreen}
        options={{ title: 'Detalle de la oferta' }}
      />
      <Stack.Screen
        name="ApplyToOffer"
        component={ApplyToOfferScreen}
        options={{ title: 'Aplicar' }}
      />
      <Stack.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{ title: 'Mis aplicaciones' }}
      />
      <Stack.Screen
        name="MyLikes"
        component={MyLikesScreen}
        options={{ title: 'Me gusta' }}
      />
    </Stack.Navigator>
  );
}
