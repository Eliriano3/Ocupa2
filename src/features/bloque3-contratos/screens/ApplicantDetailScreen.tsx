/**
 * Detalle del aplicante — Bloque 3 · Aplicantes y contratos.
 * Endpoints: PATCH /applications/{id}
 *
 * TODO(Bloque 3 · Aplicantes y contratos): pantalla pendiente de implementar.
 * Comentario y respuestas del aplicante, con las acciones de calificar (1-5), descartar, marcar finalista y elegir ganador.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function ApplicantDetailScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 3 · Aplicantes y contratos"
      owner="Hanier Peguero · 2024-0012"
      screen="Detalle del aplicante"
      endpoints={['PATCH /applications/{id}']}
      todo="Comentario y respuestas del aplicante, con las acciones de calificar (1-5), descartar, marcar finalista y elegir ganador."
      notes={[
        "Al mandar `status: \"winner\"` el API crea el contrato automáticamente.",
        "Puedes enviar salary, currency, startDate y duration junto con el ganador para que el contrato ya quede con términos.",
      ]}
    />
  );
}
