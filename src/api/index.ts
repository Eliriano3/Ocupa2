/**
 * Punto de entrada de la capa de API.
 *
 * Importa siempre desde aquí:
 *
 *   import { authApi, offersApi, ApiError } from '@/api';
 *   const session = await authApi.login({ email, password });
 *
 * Cada grupo es un archivo aparte (`auth.ts`, `offers.ts`, …) para que dos
 * bloques no editen el mismo archivo al mismo tiempo.
 */

export * as authApi from './auth';
export * as profileApi from './profile';
export * as catalogApi from './catalog';
export * as experiencesApi from './experiences';
export * as paymentsApi from './payments';
export * as offersApi from './offers';
export * as applicationsApi from './applications';
export * as likesApi from './likes';
export * as forumApi from './forum';
export * as contractsApi from './contracts';
export * as contentApi from './content';

export { api, configureApiClient } from './client';
export type { RequestOptions, QueryParams } from './client';

export { ApiError, messageForStatus, toApiError } from './errors';
export type { ApiErrorKind } from './errors';

export { API_BASE_URL, API_TIMEOUT_MS, MAX_UPLOAD_BYTES } from './config';

export * from './types';
