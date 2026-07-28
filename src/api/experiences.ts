/**
 * Experiencias — Bloque 5.
 * `GET /me/experiences`, `POST /me/experiences`, `DELETE /me/experiences/{id}`
 */

import { api } from './client';
import type { Experience } from './types';

/* ------------------------------ Requests ------------------------------ */

/** `POST /me/experiences` — `title` y `description` son requeridos. */
export interface CreateExperienceRequest {
  title: string;
  description: string;
  jobTypeKey?: string;
  /** URL devuelta por `POST /uploads`. */
  certificateImage?: string;
}

/* ------------------------------ Endpoints ----------------------------- */

/** Lista mis experiencias. */
export function getMyExperiences() {
  return api.get<Experience[]>('/me/experiences');
}

/** Agrega una experiencia al perfil. */
export function createExperience(body: CreateExperienceRequest) {
  return api.post<Experience>('/me/experiences', body);
}

/** Elimina una experiencia por id. */
export function deleteExperience(id: string) {
  return api.delete<unknown>(`/me/experiences/${encodeURIComponent(id)}`);
}
