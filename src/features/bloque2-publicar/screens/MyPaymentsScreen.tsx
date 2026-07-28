/**
 * Mis pagos — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /me/payments
 *
 * TODO(Bloque 2 · Publicar y pagos): pantalla pendiente de implementar.
 * Listado de los pagos hechos por el usuario, con su estado y fecha.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function MyPaymentsScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 2 · Publicar y pagos"
      owner="Josue Fondeur Román · 2024-0193"
      screen="Mis pagos"
      endpoints={['GET /me/payments']}
      todo="Listado de los pagos hechos por el usuario, con su estado y fecha."
      notes={[
        "Usa `useAsyncData` para los estados de carga, error y lista vacía.",
      ]}
    />
  );
}
