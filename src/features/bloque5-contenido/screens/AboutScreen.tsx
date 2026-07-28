/**
 * Acerca de — Bloque 5 · Contenido, foro y perfil.
 *
 * TODO(Bloque 5 · Contenido, foro y perfil): pantalla pendiente de implementar.
 * Foto, nombre y matrícula de los 5 integrantes, teléfono que llama y enlace a Telegram.
 *
 * Los tipos y las funciones del API ya están listos en `src/api`.
 * Cuando la implementes, borra `<PlaceholderScreen />` y escribe la pantalla real.
 */

import { PlaceholderScreen } from '@/components';

export default function AboutScreen() {
  return (
    <PlaceholderScreen
      block="Bloque 5 · Contenido, foro y perfil"
      owner="Katerin Cordero Cubilete · 2024-1575"
      screen="Acerca de"
      todo="Foto, nombre y matrícula de los 5 integrantes, teléfono que llama y enlace a Telegram."
      notes={[
        "Usa `Linking.openURL('tel:...')` y `Linking.openURL('https://t.me/...')`.",
      ]}
    />
  );
}
