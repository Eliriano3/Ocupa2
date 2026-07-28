/**
 * Noticia — Bloque 5 · Contenido, foro y perfil.
 *
 * TODO(Bloque 5 · Contenido, foro y perfil): pantalla pendiente de implementar.
 * Detalle de la noticia con enlace al artículo original en remolacha.net.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function NewsDetailScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 5 · Contenido, foro y perfil"
      owner="Katerin Cordero Cubilete · 2024-1575"
      screen="Noticia"
      todo="Detalle de la noticia con enlace al artículo original en remolacha.net."
      notes={[
        "El API no tiene endpoint de detalle: se usa la noticia del listado y su `url`.",
      ]}
    />
  );
}
