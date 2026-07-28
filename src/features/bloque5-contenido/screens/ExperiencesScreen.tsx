/**
 * Mis experiencias — Bloque 5 · Contenido, foro y perfil.
 * Endpoints: GET /me/experiences, POST /me/experiences, DELETE /me/experiences/{id}, POST /uploads
 *
 * TODO(Bloque 5 · Contenido, foro y perfil): pantalla pendiente de implementar.
 * Lista de experiencias con la opción de agregar (título, descripción, tipo de trabajo, imagen del certificado) y eliminar.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function ExperiencesScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 5 · Contenido, foro y perfil"
      owner="Katerin Cordero Cubilete · 2024-1575"
      screen="Mis experiencias"
      endpoints={['GET /me/experiences', 'POST /me/experiences', 'DELETE /me/experiences/{id}', 'POST /uploads']}
      todo="Lista de experiencias con la opción de agregar (título, descripción, tipo de trabajo, imagen del certificado) y eliminar."
      notes={[
        "La imagen del certificado se sube con `pickAndUploadImage()` y se manda como `certificateImage`.",
      ]}
    />
  );
}
