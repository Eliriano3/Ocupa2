/**
 * Pagos — Bloque 2.
 * `POST /payments`, `GET /me/payments`
 *
 * Pasarela simulada de 1 USD para poder publicar una oferta.
 * Tarjetas de prueba: aprobada `4242424242424242`, rechazada `4000000000000002`.
 */

import { api } from './client';
import type { Payment } from './types';

/** Tarjeta de prueba que el API aprueba. */
export const TEST_CARD_APPROVED = '4242424242424242';
/** Tarjeta de prueba que el API rechaza (402). */
export const TEST_CARD_DECLINED = '4000000000000002';

/* ------------------------------ Requests ------------------------------ */

/** `POST /payments` — `cardNumber`, `cvv`, `expMonth` y `expYear` son requeridos. */
export interface CreatePaymentRequest {
  cardNumber: string;
  cvv: string;
  expMonth: number;
  expYear: number;
  cardholder?: string;
}

/* ------------------------------ Endpoints ----------------------------- */

/**
 * Cobro simulado de 1 USD. Devuelve el pago con el `id` que hay que enviar
 * en `paymentId` al crear la oferta.
 * Errores esperados: 402 (pago rechazado).
 */
export function createPayment(body: CreatePaymentRequest) {
  return api.post<Payment>('/payments', body);
}

/** Lista mis pagos. */
export function getMyPayments() {
  return api.get<Payment[]>('/me/payments');
}
