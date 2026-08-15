/**
 * Navegación del Bloque 2 · Publicar y pagos.
 * Responsable: Josue Fondeur Román · 2024-0193.
 *
 * Este stack se monta en su propia pestaña desde `src/navigation/MainTabs.tsx`.
 *
 * El asistente de publicación va envuelto en `<PublishDraftProvider />`: el
 * borrador tiene que sobrevivir el salto de una pantalla a otra, pero muere
 * cuando se sale de la pestaña.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import { StepCounter } from '../components';
import { PublishDraftProvider } from '../state/PublishDraftContext';
import PublishOfferScreen from '../screens/PublishOfferScreen';
import OfferLocationScreen from '../screens/OfferLocationScreen';
import OfferPhotoScreen from '../screens/OfferPhotoScreen';
import OfferQuestionsScreen from '../screens/OfferQuestionsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OfferPublishedScreen from '../screens/OfferPublishedScreen';
import MyPaymentsScreen from '../screens/MyPaymentsScreen';
import MyOffersScreen from '../screens/MyOffersScreen';
import type { PublishStackParamList } from './types';

const Stack = createNativeStackNavigator<PublishStackParamList>();

export function PublishNavigator() {
  return (
    <PublishDraftProvider>
      <Stack.Navigator screenOptions={defaultStackScreenOptions}>
        <Stack.Screen
          name="PublishOffer"
          component={PublishOfferScreen}
          options={{ title: 'Nueva oferta', headerRight: () => <StepCounter step={1} /> }}
        />
        <Stack.Screen
          name="OfferLocation"
          component={OfferLocationScreen}
          options={{ title: 'Ubicación', headerRight: () => <StepCounter step={2} /> }}
        />
        <Stack.Screen
          name="OfferPhoto"
          component={OfferPhotoScreen}
          options={{ title: 'Foto y plazo', headerRight: () => <StepCounter step={3} /> }}
        />
        <Stack.Screen
          name="OfferQuestions"
          component={OfferQuestionsScreen}
          options={{ title: 'Preguntas', headerRight: () => <StepCounter step={4} /> }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Pagar publicación' }}
        />
        <Stack.Screen
          name="OfferPublished"
          component={OfferPublishedScreen}
          options={{
            title: 'Oferta publicada',
            // El flujo terminó: no se vuelve atrás al formulario ni al pago.
            headerBackVisible: false,
            gestureEnabled: false,
          }}
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
    </PublishDraftProvider>
  );
}
