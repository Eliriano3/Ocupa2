/**
 * Pagar publicación — Bloque 2 · Publicar y pagos.
 * Endpoints: POST /payments
 *
 * TODO(Bloque 2 · Publicar y pagos): pantalla pendiente de implementar.
 * Cobro simulado de 1 USD con tarjeta (cardNumber, cvv, expMonth, expYear) para poder publicar.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function PaymentScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 2 · Publicar y pagos"
      owner="Josue Fondeur Román · 2024-0193"
      screen="Pagar publicación"
      endpoints={['POST /payments']}
      todo="Cobro simulado de 1 USD con tarjeta (cardNumber, cvv, expMonth, expYear) para poder publicar."
      notes={[
        "Tarjetas de prueba: aprobada 4242424242424242, rechazada 4000000000000002.",
        "Guarda el `id` del pago aprobado: es el `paymentId` que pide `POST /offers`.",
        "Maneja el 402 (pago rechazado) con un mensaje claro.",
      ]}
    />
  );
}
