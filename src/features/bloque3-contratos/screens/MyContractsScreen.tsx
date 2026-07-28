/**
 * Mis contratos — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /me/contracts
 *
 * TODO(Bloque 3 · Aplicantes y contratos): pantalla pendiente de implementar.
 * Lista de contratos donde soy contratante o contratado, con filtro por estado (active / inactive).
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function MyContractsScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 3 · Aplicantes y contratos"
      owner="Hanier Peguero · 2024-0012"
      screen="Mis contratos"
      endpoints={['GET /me/contracts']}
      todo="Lista de contratos donde soy contratante o contratado, con filtro por estado (active / inactive)."
      notes={[
        "Muestra mi rol en cada contrato (`myRole`) y el estado del contrato.",
      ]}
    />
  );
}
