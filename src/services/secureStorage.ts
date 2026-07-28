/**
 * Guardado seguro de la sesión.
 *
 * En Android / iOS usa `expo-secure-store` (Keystore / Keychain), que cifra el
 * valor y sobrevive al cierre de la app. En web cae a `localStorage`, porque
 * SecureStore no existe ahí (solo aplica a `npm run web` durante desarrollo).
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ocupa2.session.token';
const USER_KEY = 'ocupa2.session.user';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/* ------------------------------- Sesión ------------------------------- */

export async function saveToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  try {
    return await getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Guarda una copia del usuario para pintar la pantalla al abrir la app sin
 * esperar a `GET /me`. La fuente de verdad sigue siendo el API.
 */
export async function saveUser(user: unknown): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function loadUser<T>(): Promise<T | null> {
  try {
    const raw = await getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Borra token y usuario. Se llama al cerrar sesión y al recibir un 401. */
export async function clearSession(): Promise<void> {
  await Promise.all([removeItem(TOKEN_KEY), removeItem(USER_KEY)]);
}
