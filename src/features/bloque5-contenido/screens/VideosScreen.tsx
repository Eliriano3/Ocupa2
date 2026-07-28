/**
 * Videos — Bloque 5 · Contenido, foro y perfil.
 * Endpoints: GET /videos
 *
 * TODO(Bloque 5 · Contenido, foro y perfil): pantalla pendiente de implementar.
 * Listado de videos de YouTube y reproducción dentro de la app usando el `youtubeId`.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function VideosScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 5 · Contenido, foro y perfil"
      owner="Katerin Cordero Cubilete · 2024-1575"
      screen="Videos"
      endpoints={['GET /videos']}
      todo="Listado de videos de YouTube y reproducción dentro de la app usando el `youtubeId`."
      notes={[
        "Endpoint público.",
        "Para reproducir dentro de la app instala `react-native-webview` con `npx expo install react-native-webview`.",
      ]}
    />
  );
}
