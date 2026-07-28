/**
 * Mis ofertas — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /me/offers, POST /offers/{id}/deactivate
 *
 * TODO(Bloque 2 · Publicar y pagos): pantalla pendiente de implementar.
 * Listado de mis ofertas publicadas, con la opción de desactivarlas.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function MyOffersScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 2 · Publicar y pagos"
      owner="Josue Fondeur Román · 2024-0193"
      screen="Mis ofertas"
      endpoints={['GET /me/offers', 'POST /offers/{id}/deactivate']}
      todo="Listado de mis ofertas publicadas, con la opción de desactivarlas."
      notes={[
        "Al desactivar, el API responde 409 si la oferta ya estaba desactivada.",
        "Desde aquí se entra a la lista de aplicantes del Bloque 3.",
      ]}
    />
  );
}
