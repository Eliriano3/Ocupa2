/**
 * Aplicar — Bloque 4 · Explorar, aplicar y me gusta.
 * Endpoints: POST /offers/{id}/apply
 *
 * TODO(Bloque 4 · Explorar, aplicar y me gusta): pantalla pendiente de implementar.
 * Formulario para aplicar: comentario explicando por qué eres apto y las preguntas de la oferta.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function ApplyToOfferScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 4 · Explorar, aplicar y me gusta"
      owner="Rosmeris Jimenez De La Cruz · 2024-1779"
      screen="Aplicar"
      endpoints={['POST /offers/{id}/apply']}
      todo="Formulario para aplicar: comentario explicando por qué eres apto y las preguntas de la oferta."
      notes={[
        "Renderiza las preguntas con `<DynamicForm />` usando `fromOfferQuestion` y manda el resultado en `answers` como { questionId, value }.",
        "Si ya aplicaste, el API responde 409: muéstralo con un mensaje claro.",
      ]}
    />
  );
}
