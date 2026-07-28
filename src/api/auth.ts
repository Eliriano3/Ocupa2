/**
 * Auth — Bloque 1.
 * `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`
 *
 * Son los únicos endpoints públicos junto con /news y /videos: van con
 * `auth: false` para no mandar un token viejo.
 */

import { api } from './client';
import type { User } from './types';

/* ------------------------------ Requests ------------------------------ */

/** `POST /auth/register` — todos los campos son requeridos en el spec. */
export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  /** Mínimo 6 caracteres. */
  password: string;
  /** Matrícula de un estudiante válido del padrón, ej. "99999999". */
  referralMatricula: string;
}

/** `POST /auth/login` */
export interface LoginRequest {
  email: string;
  password: string;
}

/** `POST /auth/forgot-password` */
export interface ForgotPasswordRequest {
  email: string;
  referralMatricula: string;
}

/* ------------------------------ Responses ----------------------------- */

/** Respuesta de registro y login (dentro de `data`). */
export interface AuthSession {
  token: string;
  tokenType?: string;
  user: User;
}

/* ------------------------------ Endpoints ----------------------------- */

/**
 * Crea la cuenta y devuelve el token: el usuario queda autenticado.
 * Errores esperados: 409 (correo ya registrado), 422 (matrícula no válida).
 */
export function register(body: RegisterRequest) {
  return api.post<AuthSession>('/auth/register', body, { auth: false });
}

/**
 * Inicia sesión con correo y clave.
 * Errores esperados: 401 (correo o clave incorrectos).
 */
export function login(body: LoginRequest) {
  return api.post<AuthSession>('/auth/login', body, { auth: false });
}

/**
 * Envía una clave temporal al correo si el correo y la matrícula coinciden.
 * Responde 200 siempre que la petición sea válida (no revela si la cuenta existe).
 */
export function forgotPassword(body: ForgotPasswordRequest) {
  return api.post<unknown>('/auth/forgot-password', body, { auth: false });
}
