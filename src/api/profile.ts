/**
 * Perfil — `GET /me`, `PUT /me/password`, `POST /uploads`.
 *
 * `GET /me` y `PUT /me/password` los usa el Bloque 1.
 * `POST /uploads` lo usan todos los bloques a través de
 * `src/services/imageUpload.ts` (no lo llames directo salvo que ya tengas el base64).
 */

import { api } from './client';
import type { User } from './types';

/* ------------------------------ Requests ------------------------------ */

/** `PUT /me/password` */
export interface ChangePasswordRequest {
  /** Nueva clave, mínimo 6 caracteres. */
  password: string;
}

/** `POST /uploads` */
export interface UploadImageRequest {
  /** Imagen en base64 o data URI (`data:image/png;base64,...`). Máx. 8 MB. */
  image: string;
  filename?: string;
}

/* ------------------------------ Responses ----------------------------- */

/** Respuesta de `POST /uploads` (dentro de `data`). */
export interface UploadedImage {
  key?: string;
  /** URL pública de la imagen: es lo que se guarda en ofertas, experiencias, etc. */
  url: string;
  mime?: string;
  size?: number;
}

/* ------------------------------ Endpoints ----------------------------- */

/** Datos de la cuenta autenticada. */
export function getMe() {
  return api.get<User>('/me');
}

/** Cambia la clave de la cuenta autenticada. */
export function changePassword(body: ChangePasswordRequest) {
  return api.put<unknown>('/me/password', body);
}

/**
 * Sube una imagen y devuelve su URL pública.
 * Formatos: JPG, PNG, WEBP, GIF. Máximo 8 MB.
 * Errores esperados: 422 (base64 inválido o formato no permitido), 502 (no se pudo almacenar).
 */
export function uploadImage(body: UploadImageRequest) {
  // Subir una foto puede tardar más que una petición normal.
  return api.post<UploadedImage>('/uploads', body, { timeoutMs: 60000 });
}
