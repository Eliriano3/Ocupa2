/**
 * Contratos — Bloque 3.
 * `GET /me/contracts`, `GET /contracts/{id}`, `PUT /contracts/{id}/terms`,
 * `POST /contracts/{id}/accept`, `POST /contracts/{id}/reject`,
 * `POST /contracts/{id}/comments`, `POST /contracts/{id}/photos`,
 * `POST /contracts/{id}/cancel`
 *
 * El contrato lo crea el API al marcar una aplicación como `winner`.
 */

import { api } from './client';
import type { Contract, ContractFilterStatus } from './types';

/* ------------------------------ Requests ------------------------------ */

/** Filtro de `GET /me/contracts`. */
export type ListContractsQuery = {
  status?: ContractFilterStatus;
};

/** `PUT /contracts/{id}/terms` — `salary`, `startDate` y `duration` son requeridos. */
export interface SetContractTermsRequest {
  salary: number;
  currency?: string;
  /** Formato `YYYY-MM-DD`. */
  startDate: string;
  /** Texto libre, ej. "3 meses". */
  duration: string;
}

/** `POST /contracts/{id}/comments` — `body` es requerido. */
export interface CreateContractCommentRequest {
  body: string;
}

/** `POST /contracts/{id}/photos` — ambos campos son requeridos. */
export interface AddContractPhotoRequest {
  /** URL devuelta por `/uploads`, o base64 / data URI directamente. */
  photo: string;
  description: string;
}

/** `POST /contracts/{id}/cancel` — `justification` es requerido. */
export interface CancelContractRequest {
  justification: string;
}

/* ------------------------------ Endpoints ----------------------------- */

/** Contratos donde soy contratante o contratado. */
export function getMyContracts(query: ListContractsQuery = {}) {
  return api.get<Contract[]>('/me/contracts', { query });
}

/**
 * Detalle del contrato, con comentarios y fotos.
 * Errores esperados: 403 (no eres parte del contrato), 404.
 */
export function getContract(id: string) {
  return api.get<Contract>(`/contracts/${encodeURIComponent(id)}`);
}

/**
 * Fija los términos (solo el contratante, con el contrato pendiente).
 * Errores esperados: 403 (solo el contratante).
 */
export function setContractTerms(id: string, body: SetContractTermsRequest) {
  return api.put<Contract>(`/contracts/${encodeURIComponent(id)}/terms`, body);
}

/**
 * Acepta el contrato (solo el contratado). Pasa a `active`.
 * Errores esperados: 409 (no está pendiente o no tiene términos).
 */
export function acceptContract(id: string) {
  return api.post<Contract>(`/contracts/${encodeURIComponent(id)}/accept`);
}

/** Rechaza el contrato (solo el contratado). */
export function rejectContract(id: string) {
  return api.post<Contract>(`/contracts/${encodeURIComponent(id)}/reject`);
}

/**
 * Comenta en el contrato (cualquiera de las partes, contrato activo).
 * Errores esperados: 409 (contrato no activo).
 */
export function createContractComment(id: string, body: CreateContractCommentRequest) {
  return api.post<Contract>(`/contracts/${encodeURIComponent(id)}/comments`, body);
}

/**
 * Agrega una foto con descripción (contrato activo).
 * Errores esperados: 422 (base64 inválido o formato no permitido).
 */
export function addContractPhoto(id: string, body: AddContractPhotoRequest) {
  return api.post<Contract>(`/contracts/${encodeURIComponent(id)}/photos`, body, {
    timeoutMs: 60000,
  });
}

/**
 * Cancela el contrato con justificación (cualquiera de las partes).
 * Errores esperados: 409 (contrato no activo).
 */
export function cancelContract(id: string, body: CancelContractRequest) {
  return api.post<Contract>(`/contracts/${encodeURIComponent(id)}/cancel`, body);
}
