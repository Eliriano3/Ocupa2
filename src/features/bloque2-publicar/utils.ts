/**
 * Formatos y validaciones propias del Bloque 2.
 *
 * Las validaciones genéricas (correo, clave, fecha ISO) están en
 * `@/utils/validation`: aquí solo va lo que es de publicar y pagar.
 */

import { isoDate } from '@/utils/validation';
import {
  CARD_MAX_DIGITS,
  CARD_MIN_DIGITS,
  DEADLINE_MAX_DAYS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  PAYMENT_MIN,
} from './constants';

/* ------------------------------- Fechas -------------------------------- */

const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** Fecha de hoy más `days`, en el `YYYY-MM-DD` que pide el API. */
export function isoDatePlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** `Date` → `YYYY-MM-DD` en hora local (no UTC: `toISOString` corre el día). */
export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `2026-08-22` → `22 ago 2026`. Devuelve el original si no se puede leer. */
export function formatDate(value?: string): string {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year}`;
}

/** Días entre hoy y una fecha `YYYY-MM-DD`. Negativo si ya pasó. */
function daysFromToday(value: string): number {
  const target = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Regla del spec para la fecha límite: obligatoria, con formato válido, de
 * mañana en adelante y como máximo a 30 días.
 */
export function validateDeadline(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'La fecha límite es obligatoria';

  const formatError = isoDate()(trimmed);
  if (formatError) return formatError;

  const days = daysFromToday(trimmed);
  if (days < 1) return 'La fecha límite tiene que ser de mañana en adelante';
  if (days > DEADLINE_MAX_DAYS) return `El máximo son ${DEADLINE_MAX_DAYS} días`;

  return undefined;
}

/* -------------------------------- Montos ------------------------------- */

/** `1500` → `1,500`. */
export function formatThousands(value: number): string {
  return value.toLocaleString('en-US');
}

/** Monto con su moneda, como se ve en los resúmenes: `RD$1,500`. */
export function formatMoney(amount?: number, currency = 'DOP'): string {
  if (amount === undefined || Number.isNaN(amount)) return '—';
  const prefix = currency === 'DOP' ? 'RD$' : currency === 'USD' ? 'US$' : `${currency} `;
  return `${prefix}${formatThousands(amount)}`;
}

/** Texto del campo de monto → número, o `NaN` si no es válido. */
export function parseAmount(value: string): number {
  return Number(value.replace(/[^\d.]/g, ''));
}

/** Regla del monto ofrecido al trabajador. */
export function validateAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'El pago al trabajador es obligatorio';

  const amount = parseAmount(trimmed);
  if (Number.isNaN(amount) || amount <= 0) return 'Escribe un monto válido';
  if (!Number.isInteger(amount)) return 'Escribe el monto sin centavos';
  if (amount < PAYMENT_MIN) return `El mínimo son RD$${formatThousands(PAYMENT_MIN)}`;

  return undefined;
}

/* ----------------------------- Descripción ----------------------------- */

export function validateDescription(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'La descripción es obligatoria';
  if (trimmed.length < DESCRIPTION_MIN) {
    return `Explica un poco más: al menos ${DESCRIPTION_MIN} caracteres`;
  }
  if (trimmed.length > DESCRIPTION_MAX) {
    return `No puede pasar de ${DESCRIPTION_MAX} caracteres`;
  }
  return undefined;
}

/* ------------------------------- Tarjeta ------------------------------- */

/** Deja solo los dígitos que escribió el usuario. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** `4242424242424242` → `4242 4242 4242 4242`, mientras se escribe. */
export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, CARD_MAX_DIGITS);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Los cuatro últimos dígitos, que es lo único de la tarjeta que se muestra. */
export function last4Of(value: string): string {
  return onlyDigits(value).slice(-4);
}

/**
 * Marca deducida del primer dígito (regla del emisor, IIN).
 * Solo es para mostrar un nombre en la lista de tarjetas guardadas.
 */
export function cardBrand(value: string): string {
  switch (onlyDigits(value).charAt(0)) {
    case '3':
      return 'Amex';
    case '4':
      return 'Visa';
    case '5':
      return 'Mastercard';
    case '6':
      return 'Discover';
    default:
      return 'Tarjeta';
  }
}

/**
 * Algoritmo de Luhn: se recorre de derecha a izquierda duplicando uno de cada
 * dos dígitos (restando 9 si pasa de 9) y el total tiene que ser múltiplo
 * de 10. Atrapa el típico dígito mal tecleado o transpuesto.
 *
 * Las dos tarjetas de prueba del proyecto lo pasan:
 * `4242424242424242` suma 80 y `4000000000000002` suma 10.
 */
export function passesLuhn(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 0) return false;

  let sum = 0;
  let double = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

/** `0929` → `09/29`, mientras se escribe. */
export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export interface CardExpiry {
  month: number;
  year: number;
}

/**
 * `09/29` → `{ month: 9, year: 2029 }`, o `null` si el mes no existe o la
 * tarjeta ya venció.
 */
export function parseExpiry(value: string): CardExpiry | null {
  const digits = onlyDigits(value);
  if (digits.length !== 4) return null;

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return null;

  const now = new Date();
  const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  if (expired) return null;

  return { month, year };
}

/**
 * Regla del número de tarjeta: entre 13 y 16 dígitos y que pase Luhn.
 * El campo ya no deja escribir más de `CARD_MAX_DIGITS`, así que el error de
 * largo solo aparece cuando faltan dígitos.
 */
export function validateCardNumber(value: string): string | undefined {
  const digits = onlyDigits(value);

  if (digits.length === 0) return 'El número de tarjeta es obligatorio';
  if (digits.length < CARD_MIN_DIGITS) {
    return `El número de tarjeta tiene entre ${CARD_MIN_DIGITS} y ${CARD_MAX_DIGITS} dígitos`;
  }
  if (!passesLuhn(digits)) return 'Ese número de tarjeta no es válido. Revisa los dígitos.';

  return undefined;
}

export function validateExpiry(value: string): string | undefined {
  if (onlyDigits(value).length === 0) return 'La fecha de vencimiento es obligatoria';
  return parseExpiry(value) ? undefined : 'Vencimiento no válido (MM/AA)';
}

export function validateCvv(value: string): string | undefined {
  const digits = onlyDigits(value);
  if (digits.length === 0) return 'El CVV es obligatorio';
  if (digits.length < 3 || digits.length > 4) return 'El CVV tiene 3 o 4 dígitos';
  return undefined;
}
