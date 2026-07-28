/**
 * Mapa — Bloque 4 · Explorar, aplicar y me gusta.
 * Endpoints: GET /offers
 *
 * TODO(Bloque 4 · Explorar, aplicar y me gusta): pantalla pendiente de implementar.
 * Mapa con las ofertas ubicadas por latitud y longitud; al tocar un marcador, ir al detalle.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function OffersMapScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 4 · Explorar, aplicar y me gusta"
      owner="Rosmeris Jimenez De La Cruz · 2024-1779"
      screen="Mapa"
      endpoints={['GET /offers']}
      todo="Mapa con las ofertas ubicadas por latitud y longitud; al tocar un marcador, ir al detalle."
      notes={[
        "Instalar `react-native-maps` con `npx expo install react-native-maps` y configurar la API key de Google Maps en app.json.",
        "La ubicación del usuario sale de `getCurrentLocation()` del servicio compartido.",
      ]}
    />
  );
}
