/**
 * Publicar oferta — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /job-types, POST /uploads, POST /offers
 *
 * TODO(Bloque 2 · Publicar y pagos): pantalla pendiente de implementar.
 * Formulario para publicar una oferta: tipo de trabajo, tipo de contrato, descripción, dirección, ubicación, foto obligatoria y fecha límite.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function PublishOfferScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 2 · Publicar y pagos"
      owner="Josue Fondeur Román · 2024-0193"
      screen="Publicar oferta"
      endpoints={['GET /job-types', 'POST /uploads', 'POST /offers']}
      todo="Formulario para publicar una oferta: tipo de trabajo, tipo de contrato, descripción, dirección, ubicación, foto obligatoria y fecha límite."
      notes={[
        "Cargar los tipos de trabajo con `catalogApi.getJobTypes()` y renderizar sus campos personalizados con `<DynamicForm />` (van en `customAnswers`).",
        "La foto es obligatoria: súbela con `pickAndUploadImage()` y guarda la URL en `photo`.",
        "La ubicación sale de `getCurrentLocation()` del servicio de ubicación.",
        "Sin un `paymentId` aprobado el API responde 402: manda primero al usuario a la pantalla de Pago.",
        "Constructor de preguntas para el aplicante: `text`, `date`, `select`, `check`, con `required` y `options`.",
      ]}
    />
  );
}
