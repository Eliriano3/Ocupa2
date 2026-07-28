/**
 * Definición de un campo dinámico.
 *
 * Es el contrato que comparten:
 *  - Bloque 2: campos personalizados del tipo de trabajo (`CustomField` del
 *    API) y el constructor de preguntas para el aplicante.
 *  - Bloque 4: preguntas de la oferta que el aplicante responde.
 *
 * Los tipos son los mismos del spec (`CustomField.type`): text, number, date,
 * select, check.
 */

import type { CustomField, CustomFieldType, OfferQuestion } from '@/api/types';

export type DynamicFieldType = CustomFieldType;

export interface FieldDefinition {
  /** Identificador con el que se guarda el valor. */
  key: string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  /** Obligatorio para `select`. En `check` convierte el campo en multi-opción. */
  options?: string[];
  placeholder?: string;
  /** Texto de ayuda debajo del campo. */
  hint?: string;
}

/**
 * Valor de un campo según su tipo:
 *  - text    → string
 *  - number  → number
 *  - date    → string `YYYY-MM-DD`
 *  - select  → string (una de las `options`)
 *  - check   → boolean, o string[] cuando el campo tiene `options`
 */
export type FieldValue = string | number | boolean | string[] | null;

/** Valores de un formulario dinámico, indexados por `key`. */
export type DynamicFormValues = Record<string, FieldValue>;

/** Errores de un formulario dinámico, indexados por `key`. */
export type DynamicFormErrors = Record<string, string | undefined>;

/* --------------------------- Adaptadores --------------------------- */

/**
 * Convierte un `CustomField` del API (tipo de trabajo) en una definición.
 * Bloque 2: `jobType.customFields.map(fromCustomField)`.
 */
export function fromCustomField(field: CustomField, index = 0): FieldDefinition {
  return {
    key: field.key ?? `campo_${index}`,
    label: field.label ?? field.key ?? `Campo ${index + 1}`,
    type: field.type ?? 'text',
    required: field.required ?? false,
    options: field.options,
  };
}

/**
 * Convierte una pregunta de la oferta en una definición.
 * Bloque 4: `offer.questions.map(fromOfferQuestion)`; el `key` es el
 * `questionId` que hay que devolver en `answers`.
 */
export function fromOfferQuestion(question: OfferQuestion, index = 0): FieldDefinition {
  return {
    key: question.id ?? `pregunta_${index}`,
    label: question.label ?? `Pregunta ${index + 1}`,
    type: question.type ?? 'text',
    required: question.required ?? false,
    options: question.options,
  };
}
