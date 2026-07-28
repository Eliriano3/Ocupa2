/**
 * Mi perfil — Bloque 5 · Contenido, foro y perfil.
 * Endpoints: GET /me
 *
 * TODO(Bloque 5 · Contenido, foro y perfil): pantalla pendiente de implementar.
 * Datos del perfil del usuario y acceso a sus experiencias.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function MyProfileScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 5 · Contenido, foro y perfil"
      owner="Katerin Cordero Cubilete · 2024-1575"
      screen="Mi perfil"
      endpoints={['GET /me']}
      todo="Datos del perfil del usuario y acceso a sus experiencias."
      notes={[
        "Los datos básicos de la cuenta y el cambio de clave están en la pestaña Cuenta (Bloque 1).",
      ]}
    />
  );
}
