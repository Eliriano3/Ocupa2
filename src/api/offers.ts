/**
 * Ofertas — Bloques 2 (publicar / mis ofertas) y 4 (explorar / detalle).
 * `GET /offers`, `POST /offers`, `GET /me/offers`, `GET /offers/{id}`,
 * `POST /offers/{id}/deactivate`
 */

import { api } from './client';
import type { ContractType, Offer, OfferInput } from './types';

/* ------------------------------ Requests ------------------------------ */

/** Filtros de `GET /offers`. */
export type ListOffersQuery = {
  jobTypeKey?: string;
  contractType?: ContractType;
};

/** Cuerpo de `POST /offers` (schema `OfferInput` del spec). */
export type CreateOfferRequest = OfferInput;

/* ------------------------------ Endpoints ----------------------------- */

/** Ofertas publicadas activas. La identidad del publicante viene oculta. */
export function getOffers(query: ListOffersQuery = {}) {
  return api.get<Offer[]>('/offers', { query });
}

/**
 * Publica una oferta. Requiere perfil completo, un `paymentId` aprobado y foto.
 * Errores esperados: 402 (pago requerido o inválido), 422 (datos inválidos, ej. falta foto).
 */
export function createOffer(body: CreateOfferRequest) {
  return api.post<Offer>('/offers', body);
}

/** Mis ofertas publicadas. */
export function getMyOffers() {
  return api.get<Offer[]>('/me/offers');
}

/** Detalle de una oferta. */
export function getOffer(id: string) {
  return api.get<Offer>(`/offers/${encodeURIComponent(id)}`);
}

/**
 * Desactiva una oferta (solo el publicante).
 * Errores esperados: 403 (no eres el publicante), 404, 409 (ya estaba desactivada).
 */
export function deactivateOffer(id: string) {
  return api.post<Offer>(`/offers/${encodeURIComponent(id)}/deactivate`);
}
