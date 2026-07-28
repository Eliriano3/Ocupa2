/**
 * Me gusta — Bloque 4.
 * `POST /offers/{id}/like`, `DELETE /offers/{id}/like`, `GET /me/likes`
 *
 * Dar me gusta es idempotente e independiente de aplicar.
 */

import { api } from './client';
import type { Offer } from './types';

/* ------------------------------ Responses ----------------------------- */

/** Respuesta de dar / quitar me gusta (dentro de `data`). */
export interface LikeResult {
  liked: boolean;
  likesCount: number;
}

/* ------------------------------ Endpoints ----------------------------- */

/**
 * Da me gusta a una oferta.
 * Errores esperados: 404 (oferta no encontrada).
 */
export function likeOffer(offerId: string) {
  return api.post<LikeResult>(`/offers/${encodeURIComponent(offerId)}/like`);
}

/** Quita el me gusta de una oferta. */
export function unlikeOffer(offerId: string) {
  return api.delete<LikeResult>(`/offers/${encodeURIComponent(offerId)}/like`);
}

/** Ofertas a las que di me gusta. */
export function getMyLikes() {
  return api.get<Offer[]>('/me/likes');
}
