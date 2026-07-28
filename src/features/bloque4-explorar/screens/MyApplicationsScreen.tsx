/**
 * Mis aplicaciones — Bloque 4 · Explorar, aplicar y me gusta.
 * Endpoints: GET /me/applications
 *
 * TODO(Bloque 4 · Explorar, aplicar y me gusta): pantalla pendiente de implementar.
 * Listado de las ofertas a las que apliqué, con su estado.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function MyApplicationsScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 4 · Explorar, aplicar y me gusta"
      owner="Rosmeris Jimenez De La Cruz · 2024-1779"
      screen="Mis aplicaciones"
      endpoints={['GET /me/applications']}
      todo="Listado de las ofertas a las que apliqué, con su estado."
      notes={[
        "Cuando el estado es `winner` se muestra la identidad del publicante y un enlace al contrato (Bloque 3).",
      ]}
    />
  );
}
