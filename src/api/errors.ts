/**
 * Errores del API y su traducción a mensajes que el usuario puede entender.
 *
 * Todas las pantallas deberían mostrar `error.message` tal cual: ya viene en
 * español y contextualizado. Si una pantalla necesita un texto distinto para un
 * caso puntual (ej. 409 en registro = "correo ya registrado"), compara
 * `error.status` y muestra su propio mensaje.
 */

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** Código HTTP. `0` cuando no hubo respuesta (sin conexión / timeout). */
  readonly status: number;
  /** Cuerpo crudo devuelto por el servidor, si lo hubo. */
  readonly payload: unknown;
  /** Método y ruta que fallaron, útil para depurar. */
  readonly endpoint: string;

  constructor(params: {
    kind: ApiErrorKind;
    status: number;
    message: string;
    endpoint: string;
    payload?: unknown;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.kind = params.kind;
    this.status = params.status;
    this.endpoint = params.endpoint;
    this.payload = params.payload;
  }

  /** No hay internet o el servidor no respondió. */
  get isOffline(): boolean {
    return this.kind === 'network' || this.kind === 'timeout';
  }

  /** La sesión no es válida y hay que volver a iniciar sesión. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Mensajes por defecto para los códigos que usa el API. */
export function messageForStatus(status: number, fallback?: string): string {
  switch (status) {
    case 400:
      return 'La solicitud no es válida. Revisa los datos e intenta de nuevo.';
    case 401:
      return 'Tu sesión no es válida o expiró. Inicia sesión otra vez.';
    case 402:
      return 'El pago fue rechazado o hace falta un pago aprobado.';
    case 403:
      return 'No tienes permiso para hacer esta acción.';
    case 404:
      return 'No encontramos lo que buscabas.';
    case 409:
      return 'Ese registro ya existe o el estado actual no permite esta acción.';
    case 422:
      return 'Hay datos inválidos o incompletos. Revísalos e intenta de nuevo.';
    case 502:
    case 503:
    case 504:
      return 'El servidor no está disponible en este momento. Intenta más tarde.';
    default:
      if (status >= 500) return 'Ocurrió un error en el servidor. Intenta más tarde.';
      return fallback ?? 'Ocurrió un error inesperado.';
  }
}

/** Extrae el mensaje que manda el servidor, si trae uno. */
export function extractServerMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const body = payload as Record<string, unknown>;

  const direct = body.message ?? body.error ?? body.detail;
  if (typeof direct === 'string' && direct.trim().length > 0) return direct.trim();

  // Algunos backends devuelven { errors: { campo: ["mensaje"] } }
  const errors = body.errors;
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors as Record<string, unknown>)[0];
    if (typeof first === 'string') return first;
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
  }

  return undefined;
}

/** Convierte cualquier excepción en un `ApiError` para no propagar `unknown`. */
export function toApiError(error: unknown, endpoint: string): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError({
    kind: 'network',
    status: 0,
    endpoint,
    message: 'No pudimos conectarnos. Revisa tu conexión a internet.',
    payload: error,
  });
}
