/**
 * Explorar ofertas — Bloque 4 · Explorar, aplicar y me gusta.
 * Endpoints: GET /offers, GET /job-types
 *
 * TODO(Bloque 4 · Explorar, aplicar y me gusta): pantalla pendiente de implementar.
 * Listado de ofertas activas con filtros por tipo de trabajo (jobTypeKey) y tipo de contrato (contractType).
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function ExploreOffersScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 4 · Explorar, aplicar y me gusta"
      owner="Rosmeris Jimenez De La Cruz · 2024-1779"
      screen="Explorar ofertas"
      endpoints={['GET /offers', 'GET /job-types']}
      todo="Listado de ofertas activas con filtros por tipo de trabajo (jobTypeKey) y tipo de contrato (contractType)."
      notes={[
        "Maneja los tres estados con `useAsyncData`: cargando, error de red y lista vacía.",
        "La identidad del publicante viene oculta en el listado.",
      ]}
    />
  );
}
