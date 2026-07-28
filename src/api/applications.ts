/**
 * Aplicaciones — Bloques 3 (gestión de aplicantes) y 4 (aplicar / mis aplicaciones).
 * `POST /offers/{id}/apply`, `GET /offers/{id}/applications`,
 * `GET /me/applications`, `PATCH /applications/{id}`
 */

import { api } from './client';
import type { Application, ApplicationStatus } from './types';

/* ------------------------------ Requests ------------------------------ */

/** Respuesta a una pregunta de la oferta. */
export interface ApplyAnswer {
  questionId: string;
  /** El tipo depende de la pregunta: texto, fecha, opción o booleano. */
  value: unknown;
}

/** `POST /offers/{id}/apply` — `comment` es requerido. */
export interface ApplyToOfferRequest {
  /** Por qué te consideras apto. */
  comment: string;
  answers?: ApplyAnswer[];
}

/**
 * `PATCH /applications/{id}` — todos los campos son opcionales.
 * Con `status: 'winner'` el API crea el contrato automáticamente; si mandas
 * también salary / startDate / duration, el contrato queda con esos términos.
 */
export interface UpdateApplicationRequest {
  /** 1 a 5. */
  rating?: number;
  status?: ApplicationStatus;
  salary?: number;
  currency?: string;
  /** Formato `YYYY-MM-DD`. */
  startDate?: string;
  duration?: string;
}

/* ------------------------------ Endpoints ----------------------------- */

/**
 * Aplica a una oferta.
 * Errores esperados: 409 (ya aplicaste).
 */
export function applyToOffer(offerId: string, body: ApplyToOfferRequest) {
  return api.post<Application>(`/offers/${encodeURIComponent(offerId)}/apply`, body);
}

/**
 * Aplicantes de una oferta, con su identidad (solo el dueño de la oferta).
 * Errores esperados: 403 (no eres el dueño).
 */
export function getOfferApplications(offerId: string) {
  return api.get<Application[]>(`/offers/${encodeURIComponent(offerId)}/applications`);
}

/** Ofertas a las que apliqué, con su estado. */
export function getMyApplications() {
  return api.get<Application[]>('/me/applications');
}

/** Califica, descarta, marca finalista o elige ganador (solo el dueño). */
export function updateApplication(id: string, body: UpdateApplicationRequest) {
  return api.patch<Application>(`/applications/${encodeURIComponent(id)}`, body);
}
