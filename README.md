# Ocupa2

App móvil de trabajos temporales. Expo (React Native) + TypeScript.
Proyecto final · ITLA · Fundamentos de Desarrollo Móvil · Periodo 2-2026.

API: `https://ocupa2.ia3x.com/apix` · Swagger: `https://ocupa2.ia3x.com/apix/docs`
Contrato del API: [`openapi.yaml`](openapi.yaml) · División del trabajo: [`docs/divison-tareas.md`](docs/divison-tareas.md)

## Requisitos

- Node.js 20 o superior
- Una cuenta de Expo (gratis) para generar el APK
- La app **Expo Go** en el celular para probar en desarrollo

## Instalar

```bash
npm install
```

## Correr en desarrollo

```bash
npm start
```

Se abre Metro con un código QR: escanéalo con Expo Go (Android) o con la cámara (iOS).
Para abrir directo en un emulador ya iniciado:

```bash
npm run android
```

## Verlo en el navegador

```bash
npm run web
```

Abre `http://localhost:8081` en el navegador. Sirve para revisar pantallas y
formularios rápido, sin celular ni emulador.

Ojo: la web es solo para desarrollo. Las funciones nativas no se comportan igual
—la cámara y el GPS dependen de los permisos del navegador, y el token se guarda
en `localStorage` en vez del almacenamiento cifrado del teléfono—. La entrega es
el APK: prueba ahí antes de dar algo por terminado.

Comprobar que no haya errores de tipos antes de subir cambios:

```bash
npm run typecheck
```

## Generar el APK

El APK se genera en la nube con EAS Build (no hace falta Android Studio).

```bash
npm install -g eas-cli
```

```bash
eas login
```

```bash
eas init
```

```bash
npm run apk
```

`npm run apk` es un atajo de `eas build -p android --profile preview`, que produce un
**.apk** instalable en cualquier celular (el perfil `production` genera un `.aab` para
Google Play). Al terminar, EAS devuelve un link de descarga: ese es el que se comparte
para instalar la app.

## Estructura

```
src/
├── api/          Capa de API tipada, un archivo por grupo del openapi.yaml
├── components/   UI compartida (input, botón, loader, estado vacío, error)
│   └── dynamic-fields/   Motor de campos dinámicos (Bloques 2 y 4)
├── features/     Un directorio por bloque del equipo
│   ├── bloque1-auth/         Sesión y autenticación   (implementado)
│   ├── bloque2-publicar/     Publicar y pagos         (placeholder)
│   ├── bloque3-contratos/    Aplicantes y contratos   (placeholder)
│   ├── bloque4-explorar/     Explorar, aplicar, likes (placeholder)
│   └── bloque5-contenido/    Contenido, foro, perfil  (placeholder)
├── hooks/        useForm, useAsyncData
├── navigation/   Navegador raíz y menú (cambia según haya sesión)
├── services/     Token seguro, subida de imágenes, ubicación
├── store/        Estado de sesión global (AuthContext)
├── theme/        Colores, espaciados y tipografía
└── utils/        Validaciones de formulario
```

Los imports usan el alias `@/` → `src/`:

```ts
import { offersApi } from '@/api';
import { Screen, AppButton } from '@/components';
```

## Cómo trabajamos en paralelo

Cada bloque tiene su propia carpeta en `src/features/` con sus pantallas, su
navegador y su lista de rutas. **Trabaja solo dentro de tu carpeta**: así dos
personas no editan el mismo archivo.

Lo que es de todos y conviene no tocar sin avisar al equipo:

| Carpeta | Qué es | Quién la mantiene |
| --- | --- | --- |
| `src/api/` | Funciones y tipos del API | Bloque 1 (avisa si falta un endpoint) |
| `src/components/` | UI compartida | Bloque 1 |
| `src/services/` | Imágenes, ubicación, token | Bloque 1 |
| `src/navigation/` | Menú y navegador raíz | Bloque 1 |
| `src/theme/`, `src/hooks/`, `src/utils/` | Base compartida | Bloque 1 |

Para agregar una pantalla a tu bloque:

1. Crea el archivo en `src/features/<tu-bloque>/screens/`.
2. Agrega la ruta en `src/features/<tu-bloque>/navigation/types.ts`.
3. Regístrala en el navegador de tu bloque.

Ningún paso toca archivos de otro compañero.

## Estado actual

**Implementado (Bloque 1)**

- Cliente HTTP con la base del API, token `Bearer` automático y manejo central de
  401, 402, 409, 422 y falta de conexión; desenvuelve `{ ok, data }` solo.
- Capa de API tipada con **todas** las rutas del `openapi.yaml` declaradas.
- Token guardado en almacenamiento seguro; la sesión sobrevive al cerrar la app.
- Menú que cambia según haya sesión. Sin sesión solo se ven las pantallas que el API
  deja públicas (Inicio, Noticias, Videos y Acerca de) y la pestaña "Entrar"; Foro,
  Mi perfil y Experiencias ni siquiera se montan. Al iniciar sesión aparecen Explorar,
  Publicar, Contratos y Cuenta, y el stack de contenido pasa a incluir las pantallas
  privadas.
- Componentes compartidos: input, botón, loader, estado vacío, mensaje de error,
  tarjeta y contenedor de pantalla.
- Servicio de imágenes (cámara + galería + permisos + `POST /uploads`) y servicio de
  ubicación (permisos + lat/lng).
- Motor de campos dinámicos (`text`, `number`, `date`, `select`, `check`) listo para
  los Bloques 2 y 4.
- Pantallas: Registro, Login, Olvidé mi clave, Mi cuenta y Cambiar clave, con
  validación de correo, clave de 6 caracteres mínimo y campos requeridos, y mensajes
  claros para 409 (correo ya registrado) y 422 (matrícula no válida).

**Implementado (Bloque 2)**

- Asistente de publicación en cuatro pasos con barra de progreso y pie fijo:
  detalles (tipo de trabajo, contrato, descripción, pago y los campos personalizados
  del tipo elegido), ubicación con mapa y GPS, foto obligatoria con fecha límite, y
  constructor de preguntas para el aplicante.
- Cobro de US$1 con tarjeta y creación de la oferta en la misma acción. Si el pago
  sale bien y `POST /offers` falla, el `paymentId` queda guardado y el reintento lo
  reusa: nunca se cobra dos veces.
- Confirmación de oferta publicada, "Mis ofertas" con desactivar y "Mis pagos", con
  esqueletos de carga, estado vacío y mensajes claros para 402, 409 y 422.

Ya no queda ninguna pantalla como `<PlaceholderScreen />`.
