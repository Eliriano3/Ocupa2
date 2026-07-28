/**
 * Configuración base del API de Ocupa2.
 * Fuente de verdad: openapi.yaml (servers[0].url).
 */

export const API_BASE_URL = 'https://ocupa2.ia3x.com/apix';

/** Milisegundos antes de abortar una petición. */
export const API_TIMEOUT_MS = 20000;

/** Tamaño máximo aceptado por POST /uploads (8 MB, según el spec). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
