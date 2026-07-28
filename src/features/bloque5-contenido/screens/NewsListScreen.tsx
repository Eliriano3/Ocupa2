/**
 * Noticias — Bloque 5 · Contenido, foro y perfil.
 * Endpoints: GET /news
 *
 * TODO(Bloque 5 · Contenido, foro y perfil): pantalla pendiente de implementar.
 * Listado de noticias de empleo con título, foto y resumen.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function NewsListScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 5 · Contenido, foro y perfil"
      owner="Katerin Cordero Cubilete · 2024-1575"
      screen="Noticias"
      endpoints={['GET /news']}
      todo="Listado de noticias de empleo con título, foto y resumen."
      notes={[
        "Endpoint público: funciona sin sesión iniciada.",
      ]}
    />
  );
}
