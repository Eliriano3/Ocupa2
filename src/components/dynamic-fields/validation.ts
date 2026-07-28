/**
 * Validación y valores iniciales de los formularios dinámicos.
 */

import { isoDate } from '@/utils/validation';
import type {
  DynamicFormErrors,
  DynamicFormValues,
  FieldDefinition,
  FieldValue,
} from './types';

/** Valor inicial vacío según el tipo de campo. */
export function emptyValueFor(field: FieldDefinition): FieldValue {
  switch (field.type) {
    case 'check':
      return field.options && field.options.length > 0 ? [] : false;
    case 'number':
      return '';
    default:
      return '';
  }
}

/** Construye los valores iniciales de un formulario a partir de sus campos. */
export function initialValues(
  fields: FieldDefinition[],
  overrides: DynamicFormValues = {},
): DynamicFormValues {
  const values: DynamicFormValues = {};
  for (const field of fields) {
    values[field.key] = overrides[field.key] ?? emptyValueFor(field);
  }
  return values;
}

/** `true` si el valor cuenta como vacío para un campo requerido. */
export function isEmptyValue(value: FieldValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'boolean') return value === false;
  return false;
}

/** Valida un campo. Devuelve el mensaje de error o `undefined`. */
export function validateField(field: FieldDefinition, value: FieldValue): string | undefined {
  if (field.required && isEmptyValue(value)) {
    return field.type === 'check' && !field.options
      ? 'Debes marcar esta casilla'
      : 'Este campo es obligatorio';
  }

  if (isEmptyValue(value)) return undefined;

  if (field.type === 'number') {
    const numeric = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    if (Number.isNaN(numeric)) return 'Escribe un número válido';
  }

  if (field.type === 'date' && typeof value === 'string') {
    return isoDate()(value);
  }

  if (field.type === 'select' && typeof value === 'string' && field.options) {
    if (!field.options.includes(value)) return 'Elige una de las opciones';
  }

  return undefined;
}

/** Valida todos los campos de una vez. */
export function validateFields(
  fields: FieldDefinition[],
  values: DynamicFormValues,
): DynamicFormErrors {
  const errors: DynamicFormErrors = {};
  for (const field of fields) {
    const error = validateField(field, values[field.key] ?? null);
    if (error) errors[field.key] = error;
  }
  return errors;
}

/** `true` si no hay ningún error. */
export function isValid(errors: DynamicFormErrors): boolean {
  return Object.values(errors).every((error) => !error);
}

/**
 * Deja los valores listos para enviar al API: convierte los `number` de texto
 * a número y descarta los campos vacíos que no son obligatorios.
 *
 * Bloque 2 → `customAnswers`. Bloque 4 → `answers`.
 */
export function toApiValues(
  fields: FieldDefinition[],
  values: DynamicFormValues,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    const value = values[field.key];
    if (isEmptyValue(value) && !field.required) continue;

    if (field.type === 'number' && typeof value === 'string') {
      result[field.key] = Number(value.replace(',', '.'));
      continue;
    }

    result[field.key] = value;
  }

  return result;
}
