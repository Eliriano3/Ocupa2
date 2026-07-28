/**
 * Detalle del contrato — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /contracts/{id}, PUT /contracts/{id}/terms, POST /contracts/{id}/accept, POST /contracts/{id}/reject, POST /contracts/{id}/comments, POST /contracts/{id}/photos, POST /contracts/{id}/cancel
 *
 * TODO(Bloque 3 · Aplicantes y contratos): pantalla pendiente de implementar.
 * Detalle del contrato con términos, comentarios y fotos, y las acciones según el rol.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function ContractDetailScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 3 · Aplicantes y contratos"
      owner="Hanier Peguero · 2024-0012"
      screen="Detalle del contrato"
      endpoints={['GET /contracts/{id}', 'PUT /contracts/{id}/terms', 'POST /contracts/{id}/accept', 'POST /contracts/{id}/reject', 'POST /contracts/{id}/comments', 'POST /contracts/{id}/photos', 'POST /contracts/{id}/cancel']}
      todo="Detalle del contrato con términos, comentarios y fotos, y las acciones según el rol."
      notes={[
        "Solo el contratante fija los términos (salary, currency, startDate, duration).",
        "Solo el contratado acepta o rechaza; aceptar sin términos responde 409.",
        "Comentar y subir fotos requiere el contrato activo (si no, 409).",
        "Para las fotos usa `pickAndUploadImage()` y manda la URL en `photo`.",
      ]}
    />
  );
}
