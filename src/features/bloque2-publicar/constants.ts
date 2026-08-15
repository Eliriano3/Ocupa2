/**
 * Medidas y reglas del flujo de publicación — Bloque 2.
 *
 * Vienen del spec de diseño «Ocupa2 · Publicar oferta» (Android 412×915dp).
 * Los colores y los espaciados NO se redefinen aquí: salen de `@/theme`, que es
 * el sistema que comparten los cinco bloques.
 */

import type { ContractType, OfferQuestionType } from '@/api/types';

/* ------------------------------- Medidas ------------------------------- */

/** Alto de campo del spec (Android usa 52dp, 4 más que la referencia iOS). */
export const FIELD_HEIGHT = 52;
/** Área táctil mínima de Android. */
export const TOUCH_TARGET = 48;
/** Alto del pie fijo que sostiene el botón principal. */
export const FOOTER_HEIGHT = 88;
/** Barra de progreso del asistente. */
export const PROGRESS_HEIGHT = 4;
/** Alto de la zona para soltar la foto. */
export const DROPZONE_HEIGHT = 190;
/** Alto del mapa en el paso de ubicación. */
export const MAP_HEIGHT = 300;
/** Duración del shimmer de los esqueletos de carga. */
export const SHIMMER_MS = 1200;
/** Tiempo que el snackbar queda en pantalla antes de irse solo. */
export const SNACKBAR_MS = 4000;

/**
 * Tamaño «display» de la pantalla de confirmación. La escala compartida de
 * `@/theme` llega hasta 26 porque ninguna otra pantalla la necesita más grande;
 * este es el único lugar del bloque que se sale, y por eso queda con nombre.
 */
export const DISPLAY_FONT_SIZE = 44;

/* -------------------------------- Pasos -------------------------------- */

export const TOTAL_STEPS = 4;

/* ------------------------------- Reglas -------------------------------- */

/** `description` — el contador se pinta en rojo al pasar el aviso. */
export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 600;
export const DESCRIPTION_WARN = 580;

/** Monto ofrecido al trabajador. */
export const PAYMENT_MIN = 300;
export const PAYMENT_CURRENCY = 'DOP';

/** `deadline` — entre mañana y 30 días. */
export const DEADLINE_MAX_DAYS = 30;

/** Preguntas para el aplicante. */
export const QUESTIONS_MAX = 5;
export const QUESTION_LABEL_MIN = 5;
export const QUESTION_LABEL_MAX = 120;

/** Costo fijo de publicar, tal como lo cobra `POST /payments`. */
export const PUBLISH_PRICE_USD = '1.00';

/* ------------------------------- Tarjeta ------------------------------- */

/**
 * Tope de dígitos del número de tarjeta. 16 es el largo de Visa y Mastercard,
 * y el de las dos tarjetas de prueba del proyecto.
 */
export const CARD_MAX_DIGITS = 16;

/** Mínimo del estándar ISO/IEC 7812; deja pasar Amex, que tiene 15. */
export const CARD_MIN_DIGITS = 13;

/** Cuántas tarjetas se recuerdan como máximo. */
export const SAVED_CARDS_MAX = 5;

/* ------------------------------ Etiquetas ------------------------------ */

/** `OfferInput.contractType` con el nombre que ve el usuario. */
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  temporal: 'Temporal',
  fijo: 'Fijo',
  horas: 'Por horas',
};

/** Sufijo del monto según el tipo de contrato. */
export const CONTRACT_TYPE_UNITS: Record<ContractType, string> = {
  temporal: 'por el trabajo',
  fijo: 'por mes',
  horas: 'por hora',
};

/**
 * Tipos de pregunta que acepta `OfferInput.questions[]`.
 * El spec no incluye `number` aquí, por eso son cuatro y no cinco.
 */
export const QUESTION_TYPE_LABELS: Record<OfferQuestionType, string> = {
  text: 'Texto',
  date: 'Fecha',
  check: 'Sí / No',
  select: 'Opciones',
};

/** Orden en el que se muestran los tipos en el selector. */
export const QUESTION_TYPE_ORDER: OfferQuestionType[] = ['text', 'date', 'check', 'select'];
