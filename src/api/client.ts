/**
 * Cliente HTTP central de Ocupa2.
 *
 * Qué resuelve por ti (no lo repitas en cada pantalla):
 *  - Antepone la base `https://ocupa2.ia3x.com/apix`.
 *  - Inyecta `Authorization: Bearer <token>` cuando hay sesión.
 *  - Desenvuelve `{ ok, data }` y devuelve directamente `data` ya tipado.
 *  - Convierte cualquier fallo (401, 402, 409, 422, 5xx, sin conexión,
 *    timeout) en un `ApiError` con mensaje en español.
 *  - Avisa a la app cuando el token dejó de ser válido (401) para cerrar
 *    sesión automáticamente.
 *
 * El token no se lee aquí: lo provee `AuthProvider` mediante
 * `configureApiClient`, para que el cliente no dependa del estado de React.
 */

import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { ApiError, extractServerMessage, messageForStatus } from './errors';
import type { ApiEnvelope } from './types';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  /** Parámetros de query string. Los `undefined` / `null` se omiten. */
  query?: QueryParams;
  /** Cuerpo JSON. */
  body?: unknown;
  /**
   * `true` (por defecto) envía el token si hay sesión.
   * Ponlo en `false` en endpoints públicos: login, registro, /news, /videos.
   */
  auth?: boolean;
  /** Para cancelar la petición desde la pantalla (ej. al desmontar). */
  signal?: AbortSignal;
  /** Sobrescribe el timeout por defecto. */
  timeoutMs?: number;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ClientConfig {
  /** Devuelve el token vigente, o `null` si no hay sesión. */
  getToken: () => string | null;
  /** Se llama cuando una petición autenticada recibe 401. */
  onUnauthorized: () => void;
}

const config: ClientConfig = {
  getToken: () => null,
  onUnauthorized: () => {},
};

/** Conecta el cliente con el estado de sesión de la app. */
export function configureApiClient(partial: Partial<ClientConfig>): void {
  Object.assign(config, partial);
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  let url = `${API_BASE_URL}${normalized}`;

  if (query) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      search.append(key, String(value));
    }
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  return url;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/** `true` si la respuesta tiene la forma `{ ok, data }`. */
function isEnvelope(payload: unknown): payload is ApiEnvelope<unknown> {
  return typeof payload === 'object' && payload !== null && 'ok' in payload;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, body, auth = true, signal, timeoutMs = API_TIMEOUT_MS } = options;
  const endpoint = `${method} ${path}`;
  const url = buildUrl(path, query);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? config.getToken() : null;
  const sentWithToken = Boolean(token);
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    // Cancelada por quien llamó: se propaga tal cual para no mostrar error.
    if (signal?.aborted) throw error;

    const timedOut = controller.signal.aborted;
    throw new ApiError({
      kind: timedOut ? 'timeout' : 'network',
      status: 0,
      endpoint,
      payload: error,
      message: timedOut
        ? 'El servidor tardó demasiado en responder. Intenta de nuevo.'
        : 'Sin conexión. Revisa tu internet e intenta de nuevo.',
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  const payload = await readBody(response);

  if (!response.ok) {
    // Solo cerramos sesión si el 401 vino de una petición que llevaba token:
    // un 401 en el login significa "credenciales incorrectas", no "sesión vencida".
    if (response.status === 401 && sentWithToken) config.onUnauthorized();

    throw new ApiError({
      kind: 'http',
      status: response.status,
      endpoint,
      payload,
      message: extractServerMessage(payload) ?? messageForStatus(response.status),
    });
  }

  if (isEnvelope(payload)) {
    if (payload.ok === false) {
      throw new ApiError({
        kind: 'http',
        status: response.status,
        endpoint,
        payload,
        message: extractServerMessage(payload) ?? 'La operación no se pudo completar.',
      });
    }
    return payload.data as T;
  }

  // Respuesta sin envoltura (ej. 204 sin cuerpo): se devuelve tal cual.
  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
