/**
 * Tarjetas recordadas para no volver a teclear los 16 dígitos en cada oferta.
 *
 * Reglas que no se negocian:
 *
 *  - **El CVV nunca se guarda.** Se pide siempre, aunque la tarjeta esté
 *    recordada. Es lo que hace que un teléfono perdido no pueda cobrar solo.
 *  - Se guarda solo si el usuario lo pide con el switch: nunca por defecto.
 *  - En Android / iOS va en `expo-secure-store` (Keystore / Keychain), cifrado
 *    por el sistema — el mismo almacén donde el Bloque 1 guarda el token.
 *  - En web cae a `localStorage`, igual que `src/services/secureStorage.ts`,
 *    porque SecureStore no existe ahí. La web es solo para desarrollo.
 *
 * El API no tiene endpoint de tarjetas guardadas: esto vive solo en el
 * teléfono y se va con la app.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { SAVED_CARDS_MAX } from '../constants';
import { cardBrand, last4Of, onlyDigits } from '../utils';

const CARDS_KEY = 'ocupa2.bloque2.saved_cards';
const isWeb = Platform.OS === 'web';

/** Una tarjeta recordada. Sin CVV, a propósito. */
export interface SavedCard {
  /** Id local; no viene del API. */
  id: string;
  /** Número completo, para rellenar el campo al reusarla. */
  number: string;
  expMonth: number;
  expYear: number;
  cardholder?: string;
  /** Derivados, para pintar la lista sin tener que leer el número. */
  last4: string;
  brand: string;
}

/* ----------------------------- Almacenamiento ---------------------------- */

async function readRaw(): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(CARDS_KEY) ?? null;
  return SecureStore.getItemAsync(CARDS_KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(CARDS_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(CARDS_KEY, value);
}

async function clearRaw(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(CARDS_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(CARDS_KEY);
}

/* -------------------------------- API ---------------------------------- */

/** Tarjetas recordadas, de la más reciente a la más vieja. */
export async function loadSavedCards(): Promise<SavedCard[]> {
  try {
    const raw = await readRaw();
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedCard);
  } catch {
    // Un almacén corrupto no debe tumbar la pantalla de pago.
    return [];
  }
}

/**
 * Recuerda una tarjeta. Si ya estaba (mismo número), la actualiza y la sube al
 * principio en vez de duplicarla.
 */
export async function saveCard(input: {
  number: string;
  expMonth: number;
  expYear: number;
  cardholder?: string;
}): Promise<SavedCard[]> {
  const number = onlyDigits(input.number);

  const card: SavedCard = {
    id: `card_${number.slice(-4)}_${input.expMonth}${input.expYear}`,
    number,
    expMonth: input.expMonth,
    expYear: input.expYear,
    cardholder: input.cardholder,
    last4: last4Of(number),
    brand: cardBrand(number),
  };

  const current = await loadSavedCards();
  const others = current.filter((saved) => saved.number !== number);
  const next = [card, ...others].slice(0, SAVED_CARDS_MAX);

  await writeRaw(JSON.stringify(next));
  return next;
}

/** Olvida una tarjeta. */
export async function removeSavedCard(id: string): Promise<SavedCard[]> {
  const next = (await loadSavedCards()).filter((card) => card.id !== id);

  if (next.length === 0) await clearRaw();
  else await writeRaw(JSON.stringify(next));

  return next;
}

/** `true` si la tarjeta ya venció y no sirve para cobrar. */
export function isExpired(card: SavedCard, now = new Date()): boolean {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return card.expYear < year || (card.expYear === year && card.expMonth < month);
}

/* ------------------------------- Interno -------------------------------- */

function isSavedCard(value: unknown): value is SavedCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;

  return (
    typeof card.id === 'string' &&
    typeof card.number === 'string' &&
    typeof card.expMonth === 'number' &&
    typeof card.expYear === 'number' &&
    typeof card.last4 === 'string' &&
    typeof card.brand === 'string'
  );
}
