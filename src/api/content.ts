/**
 * Noticias y videos — Bloque 5.
 * `GET /news`, `GET /videos`
 *
 * Son los dos endpoints públicos del API: van con `auth: false` para que
 * funcionen también sin sesión iniciada.
 */

import { api } from './client';
import type { NewsItem, Video } from './types';

/* ------------------------------ Requests ------------------------------ */

/** Filtros de `GET /news`. */
export type ListNewsQuery = {
  /** Por defecto 12, máximo 30. */
  limit?: number;
};

/* ------------------------------ Endpoints ----------------------------- */

/** Noticias de empleo (fuente: remolacha.net). Público. */
export function getNews(query: ListNewsQuery = {}) {
  return api.get<NewsItem[]>('/news', { query, auth: false });
}

/** Videos de YouTube sobre empleo, curados por el admin. Público. */
export function getVideos() {
  return api.get<Video[]>('/videos', { auth: false });
}
