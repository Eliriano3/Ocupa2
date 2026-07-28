/**
 * Validaciones de formulario compartidas.
 *
 * Cada validador devuelve el mensaje de error (string) o `undefined` si el
 * valor es válido, para poder encadenarlos:
 *
 *   const error = firstError(value, [required(), email()]);
 */

export type Validator = (value: string) => string | undefined;

/** Clave mínima que exige el API (`minLength: 6` en el spec). */
export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function required(message = 'Este campo es obligatorio'): Validator {
  return (value) => (value.trim().length === 0 ? message : undefined);
}

export function email(message = 'Escribe un correo válido'): Validator {
  return (value) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined; // lo cubre `required`
    return EMAIL_REGEX.test(trimmed) ? undefined : message;
  };
}

export function minLength(length: number, message?: string): Validator {
  return (value) =>
    value.length < length
      ? (message ?? `Debe tener al menos ${length} caracteres`)
      : undefined;
}

export function maxLength(length: number, message?: string): Validator {
  return (value) =>
    value.length > length
      ? (message ?? `No puede pasar de ${length} caracteres`)
      : undefined;
}

/** Clave del API: obligatoria y de 6 caracteres o más. */
export function password(): Validator {
  return (value) => {
    if (value.length === 0) return 'La clave es obligatoria';
    if (value.length < MIN_PASSWORD_LENGTH) {
      return `La clave debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }
    return undefined;
  };
}

/** Solo dígitos (matrícula de referido, CVV, número de tarjeta). */
export function digitsOnly(message = 'Solo se permiten números'): Validator {
  return (value) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;
    return /^\d+$/.test(trimmed) ? undefined : message;
  };
}

/** Fecha en formato `YYYY-MM-DD`, el que usa el API. */
export function isoDate(message = 'Usa el formato AAAA-MM-DD'): Validator {
  return (value) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return message;
    const date = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(date.getTime()) ? message : undefined;
  };
}

/** Devuelve el primer error encontrado, o `undefined` si todo pasa. */
export function firstError(value: string, validators: Validator[]): string | undefined {
  for (const validate of validators) {
    const error = validate(value);
    if (error) return error;
  }
  return undefined;
}
