/**
 * Foro — Bloque 5.
 * `GET /forum/topics`, `POST /forum/topics`, `GET /forum/topics/{id}`,
 * `POST /forum/topics/{id}/comments`
 */

import { api } from './client';
import type { ForumComment, ForumTopic, ForumTopicDetail } from './types';

/* ------------------------------ Requests ------------------------------ */

/** `POST /forum/topics` — `title` y `description` son requeridos. */
export interface CreateTopicRequest {
  title: string;
  description: string;
}

/** `POST /forum/topics/{id}/comments` — `body` es requerido. */
export interface CreateTopicCommentRequest {
  body: string;
}

/* ------------------------------ Endpoints ----------------------------- */

/** Temas ordenados por última actividad. */
export function getTopics() {
  return api.get<ForumTopic[]>('/forum/topics');
}

/** Crea un tema. */
export function createTopic(body: CreateTopicRequest) {
  return api.post<ForumTopic>('/forum/topics', body);
}

/**
 * Detalle del tema con sus comentarios.
 * Errores esperados: 404 (tema no encontrado).
 */
export function getTopic(id: string) {
  return api.get<ForumTopicDetail>(`/forum/topics/${encodeURIComponent(id)}`);
}

/** Comenta en un tema. */
export function createTopicComment(id: string, body: CreateTopicCommentRequest) {
  return api.post<ForumComment>(`/forum/topics/${encodeURIComponent(id)}/comments`, body);
}
