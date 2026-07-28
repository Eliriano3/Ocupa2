/**
 * Detalle de la oferta — Bloque 4 · Explorar, aplicar y me gusta.
 * Endpoints: GET /offers/{id}, POST /offers/{id}/like, DELETE /offers/{id}/like
 *
 * TODO(Bloque 4 · Explorar, aplicar y me gusta): pantalla pendiente de implementar.
 * Detalle con tipo de trabajo, contrato, ubicación, dirección, pago, descripción, foto y fecha límite, más el botón de me gusta.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function OfferDetailScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 4 · Explorar, aplicar y me gusta"
      owner="Rosmeris Jimenez De La Cruz · 2024-1779"
      screen="Detalle de la oferta"
      endpoints={['GET /offers/{id}', 'POST /offers/{id}/like', 'DELETE /offers/{id}/like']}
      todo="Detalle con tipo de trabajo, contrato, ubicación, dirección, pago, descripción, foto y fecha límite, más el botón de me gusta."
      notes={[
        "La identidad del publicante solo es visible para el ganador.",
      ]}
    />
  );
}
