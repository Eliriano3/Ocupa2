/**
 * Tipos del API de Ocupa2.
 *
 * Traducción directa de `openapi.yaml` → `components/schemas`.
 * Los campos marcados como `required` en el spec son obligatorios aquí; el
 * resto es opcional.
 *
 * Algunos endpoints del spec documentan la respuesta solo con una descripción
 * ("200: Lista de ofertas") y no con un schema. Esos tipos están agrupados más
 * abajo bajo "Tipos inferidos" y llevan una nota: si el backend devuelve algo
 * distinto, ajústalos aquí y el cambio se propaga a toda la app.
 */

/* ------------------------------------------------------------------ *
 * Envoltura común
 * ------------------------------------------------------------------ */

/** Todas las respuestas del API vienen envueltas así. */
export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

/* ------------------------------------------------------------------ *
 * Enums del spec
 * ------------------------------------------------------------------ */

/** `OfferInput.contractType` y filtro de `GET /offers`. */
export const CONTRACT_TYPES = ['temporal', 'fijo', 'horas'] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

/** `CustomField.type` — tipos de campo dinámico soportados. */
export const CUSTOM_FIELD_TYPES = ['text', 'number', 'date', 'select', 'check'] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

/** `OfferInput.questions[].type` — el spec no incluye `number` aquí. */
export const OFFER_QUESTION_TYPES = ['text', 'date', 'select', 'check'] as const;
export type OfferQuestionType = (typeof OFFER_QUESTION_TYPES)[number];

/** `PATCH /applications/{id}` → `status`. */
export const APPLICATION_STATUSES = ['applied', 'discarded', 'finalist', 'winner'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** `Contract.status`. */
export const CONTRACT_STATUSES = ['pending', 'active', 'rejected', 'cancelled'] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

/** `Contract.myRole`. */
export const CONTRACT_ROLES = ['contratante', 'contratado'] as const;
export type ContractRole = (typeof CONTRACT_ROLES)[number];

/** Filtro de `GET /me/contracts` → `status`. */
export const CONTRACT_FILTER_STATUSES = ['active', 'inactive'] as const;
export type ContractFilterStatus = (typeof CONTRACT_FILTER_STATUSES)[number];

/** `User.gender` y `PUT /me/profile` → `gender`. */
export const GENDERS = ['masculino', 'femenino', 'otro'] as const;
export type Gender = (typeof GENDERS)[number];

/* ------------------------------------------------------------------ *
 * components/schemas
 * ------------------------------------------------------------------ */

/** `#/components/schemas/User` */
export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  /** Nombre completo. */
  nombre?: string;
  /** 11 dígitos. Se completa en el perfil, no en el registro. */
  cedula?: string;
  gender?: Gender;
  birthDate?: string;
  /** `true` cuando ya completó cédula, género y fecha de nacimiento. */
  profileCompleted?: boolean;
  /** Matrícula de referido con la que se creó la cuenta. */
  referralMatricula?: string;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

/** `#/components/schemas/CustomField` — campo dinámico de un tipo de trabajo. */
export interface CustomField {
  key?: string;
  label?: string;
  type?: CustomFieldType;
  required?: boolean;
  options?: string[];
}

/** `#/components/schemas/ContractParty` */
export interface ContractParty {
  id?: string;
  nombre?: string;
  email?: string;
}

/** Comentario dentro de `Contract.comments`. */
export interface ContractComment {
  by?: ContractParty;
  body?: string;
  createdAt?: string;
}

/** Foto dentro de `Contract.photos`. */
export interface ContractPhoto {
  by?: ContractParty;
  url?: string;
  description?: string;
  createdAt?: string;
}

/** `#/components/schemas/Contract` */
export interface Contract {
  id?: string;
  offerId?: string;
  jobTypeName?: string;
  contratante?: ContractParty;
  contratado?: ContractParty;
  myRole?: ContractRole;
  salary?: number;
  currency?: string;
  startDate?: string;
  duration?: string;
  status?: ContractStatus;
  createdAt?: string;
  acceptedAt?: string;
  cancelJustification?: string;
  cancelledBy?: ContractParty;
  cancelledAt?: string;
  comments?: ContractComment[];
  photos?: ContractPhoto[];
}

/** `#/components/schemas/ForumAuthor` */
export interface ForumAuthor {
  id?: string;
  nombre?: string;
}

/** `#/components/schemas/ForumComment` */
export interface ForumComment {
  id?: string;
  body?: string;
  author?: ForumAuthor;
  createdAt?: string;
}

/** `#/components/schemas/ForumTopic` */
export interface ForumTopic {
  id?: string;
  title?: string;
  description?: string;
  author?: ForumAuthor;
  commentsCount?: number;
  createdAt?: string;
  lastActivityAt?: string;
}

/** `#/components/schemas/ForumTopicDetail` (allOf ForumTopic + comments). */
export interface ForumTopicDetail extends ForumTopic {
  comments?: ForumComment[];
}

/** `#/components/schemas/Video` */
export interface Video {
  id?: string;
  /** Código del video de YouTube, ej. `fmeNtmRRwQM`. */
  youtubeId?: string;
  url?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  order?: number;
}

/** `#/components/schemas/NewsItem` */
export interface NewsItem {
  title?: string;
  image?: string;
  summary?: string;
  date?: string;
  url?: string;
  source?: string;
}

/** Coordenadas usadas en `OfferInput.location`. */
export interface GeoLocation {
  lat: number;
  lng: number;
}

/** Monto ofrecido en `OfferInput.payment`. */
export interface OfferPayment {
  amount?: number;
  currency?: string;
}

/** Pregunta que el publicante define para los aplicantes (`OfferInput.questions`). */
export interface OfferQuestionInput {
  label?: string;
  type?: OfferQuestionType;
  required?: boolean;
  options?: string[];
}

/** `#/components/schemas/OfferInput` — cuerpo de `POST /offers`. */
export interface OfferInput {
  jobTypeKey: string;
  contractType: ContractType;
  description: string;
  address: string;
  /** URL devuelta por `POST /uploads` (obligatoria). */
  photo: string;
  /** `id` de un pago aprobado en `POST /payments`. */
  paymentId: string;
  payment: OfferPayment;
  location?: GeoLocation;
  /** Fecha límite, formato `YYYY-MM-DD`. */
  deadline?: string;
  /** Respuestas a los campos personalizados del tipo de trabajo. */
  customAnswers?: Record<string, unknown>;
  questions?: OfferQuestionInput[];
}

/* ------------------------------------------------------------------ *
 * Tipos inferidos
 *
 * El spec no define schema para estas respuestas (solo una descripción).
 * Se infieren de la documentación y del uso esperado en la app.
 * ------------------------------------------------------------------ */

/** `GET /job-types` — inferido. */
export interface JobType {
  key?: string;
  name?: string;
  description?: string;
  /** Campos extra que el publicante debe llenar para este tipo de trabajo. */
  customFields?: CustomField[];
}

/** `GET /me/experiences` — inferido. */
export interface Experience {
  id?: string;
  title?: string;
  description?: string;
  jobTypeKey?: string;
  jobTypeName?: string;
  /** URL devuelta por `POST /uploads`. */
  certificateImage?: string;
  createdAt?: string;
}

/** `POST /payments` y `GET /me/payments` — inferido. */
export interface Payment {
  id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  /** Últimos dígitos de la tarjeta usada. */
  last4?: string;
  cardholder?: string;
  createdAt?: string;
  /** `true` cuando el pago ya se usó para publicar una oferta. */
  used?: boolean;
}

/** Pregunta ya publicada dentro de una oferta — inferido. */
export interface OfferQuestion {
  id?: string;
  label?: string;
  type?: OfferQuestionType;
  required?: boolean;
  options?: string[];
}

/** `GET /offers`, `GET /offers/{id}`, `GET /me/offers` — inferido. */
export interface Offer {
  id?: string;
  jobTypeKey?: string;
  jobTypeName?: string;
  contractType?: ContractType;
  description?: string;
  address?: string;
  photo?: string;
  location?: GeoLocation;
  payment?: OfferPayment;
  deadline?: string;
  active?: boolean;
  createdAt?: string;
  customAnswers?: Record<string, unknown>;
  questions?: OfferQuestion[];
  likesCount?: number;
  /** `true` si el usuario autenticado ya le dio me gusta. */
  liked?: boolean;
  applicationsCount?: number;
  /** `true` si el usuario autenticado ya aplicó. */
  applied?: boolean;
  /** Solo visible para el ganador; oculto en el resto de los casos. */
  publisher?: ContractParty;
}

/** Respuesta de un aplicante a una pregunta de la oferta — inferido. */
export interface ApplicationAnswer {
  questionId?: string;
  label?: string;
  value?: unknown;
}

/** `GET /offers/{id}/applications`, `GET /me/applications` — inferido. */
export interface Application {
  id?: string;
  offerId?: string;
  offer?: Offer;
  /** Identidad del aplicante: visible para el dueño de la oferta. */
  applicant?: ContractParty;
  comment?: string;
  answers?: ApplicationAnswer[];
  rating?: number;
  status?: ApplicationStatus;
  contractId?: string;
  createdAt?: string;
}
