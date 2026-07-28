/**
 * Aplicantes — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /offers/{id}/applications
 *
 * TODO(Bloque 3 · Aplicantes y contratos): pantalla pendiente de implementar.
 * Lista de aplicantes de una oferta (solo el dueño), con su identidad y estado.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function ApplicantsListScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 3 · Aplicantes y contratos"
      owner="Hanier Peguero · 2024-0012"
      screen="Aplicantes"
      endpoints={['GET /offers/{id}/applications']}
      todo="Lista de aplicantes de una oferta (solo el dueño), con su identidad y estado."
      notes={[
        "Si no eres el dueño de la oferta el API responde 403.",
      ]}
    />
  );
}
