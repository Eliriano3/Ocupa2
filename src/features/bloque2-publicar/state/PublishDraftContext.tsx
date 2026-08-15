/**
 * Borrador de la oferta que se está publicando — Bloque 2.
 *
 * Los cuatro pasos del asistente son pantallas distintas del mismo stack, así
 * que lo que se llena en el paso 1 tiene que seguir vivo en el paso 4 y en el
 * pago. En vez de pasar diez parámetros de ruta en ruta, el borrador vive en un
 * contexto montado por encima del navegador del bloque.
 *
 *   const { draft, patch } = usePublishDraft();
 *   patch({ description: texto });
 *
 * El borrador solo vive en memoria: sale de la app y se pierde. Persistirlo
 * entre reinicios pediría `@react-native-async-storage/async-storage`, que hoy
 * no es dependencia del proyecto.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type {
  ContractType,
  GeoLocation,
  OfferInput,
  OfferQuestionType,
} from '@/api/types';
import { PAYMENT_CURRENCY } from '../constants';

/** Pregunta mientras se arma: lleva un id local para poder editarla y moverla. */
export interface DraftQuestion {
  /** Id solo del cliente; no se manda al API. */
  id: string;
  label: string;
  type: OfferQuestionType;
  required: boolean;
  /** Solo para `select`. */
  options: string[];
}

export interface OfferDraft {
  /* Paso 1 · detalles */
  jobTypeKey: string;
  /** Nombre legible del tipo elegido, para los resúmenes. */
  jobTypeName: string;
  contractType: ContractType;
  description: string;
  /** Monto para el trabajador, como texto mientras se escribe. */
  amount: string;
  currency: string;
  /** Respuestas a los campos personalizados del tipo de trabajo. */
  customAnswers: Record<string, unknown>;

  /* Paso 2 · ubicación */
  address: string;
  location: GeoLocation | null;

  /* Paso 3 · foto y plazo */
  /** URL pública devuelta por `POST /uploads`. */
  photo: string | null;
  /** `YYYY-MM-DD`. */
  deadline: string;

  /* Paso 4 · preguntas */
  questions: DraftQuestion[];

  /* Pago */
  /** `id` de un pago aprobado en `POST /payments`. */
  paymentId: string | null;
}

export const EMPTY_DRAFT: OfferDraft = {
  jobTypeKey: '',
  jobTypeName: '',
  contractType: 'temporal',
  description: '',
  amount: '',
  currency: PAYMENT_CURRENCY,
  customAnswers: {},
  address: '',
  location: null,
  photo: null,
  deadline: '',
  questions: [],
  paymentId: null,
};

interface PublishDraftValue {
  draft: OfferDraft;
  /** Cambia solo los campos que le pases. */
  patch: (changes: Partial<OfferDraft>) => void;
  /** Vuelve a dejarlo vacío (al publicar o al descartar). */
  reset: () => void;
}

const PublishDraftContext = createContext<PublishDraftValue | null>(null);

export function PublishDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OfferDraft>(EMPTY_DRAFT);

  const patch = useCallback((changes: Partial<OfferDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  }, []);

  const reset = useCallback(() => setDraft(EMPTY_DRAFT), []);

  const value = useMemo(() => ({ draft, patch, reset }), [draft, patch, reset]);

  return <PublishDraftContext.Provider value={value}>{children}</PublishDraftContext.Provider>;
}

export function usePublishDraft(): PublishDraftValue {
  const value = useContext(PublishDraftContext);
  if (!value) {
    throw new Error('usePublishDraft se usa dentro de <PublishDraftProvider />.');
  }
  return value;
}

/* ------------------------------- Ayudas -------------------------------- */

/**
 * Borrador → cuerpo de `POST /offers`.
 *
 * El `id` local de cada pregunta no se manda: el API le pone el suyo.
 * `location`, `deadline` y `customAnswers` van solo si tienen contenido, para
 * no mandar campos vacíos que el 422 rebotaría.
 */
export function toOfferInput(draft: OfferDraft, paymentId: string): OfferInput {
  const body: OfferInput = {
    jobTypeKey: draft.jobTypeKey,
    contractType: draft.contractType,
    description: draft.description.trim(),
    address: draft.address.trim(),
    photo: draft.photo ?? '',
    paymentId,
    payment: {
      amount: Number(draft.amount.replace(/[^\d.]/g, '')),
      currency: draft.currency,
    },
  };

  if (draft.location) body.location = draft.location;
  if (draft.deadline.trim().length > 0) body.deadline = draft.deadline.trim();
  if (Object.keys(draft.customAnswers).length > 0) body.customAnswers = draft.customAnswers;

  if (draft.questions.length > 0) {
    body.questions = draft.questions.map((question) => ({
      label: question.label,
      type: question.type,
      required: question.required,
      ...(question.type === 'select' ? { options: question.options } : {}),
    }));
  }

  return body;
}

/** Lo que le falta al borrador para poder publicarse. Vacío = listo. */
export function missingFields(draft: OfferDraft): string[] {
  const missing: string[] = [];
  if (!draft.jobTypeKey) missing.push('el tipo de trabajo');
  if (draft.description.trim().length === 0) missing.push('la descripción');
  if (draft.address.trim().length === 0) missing.push('la dirección');
  if (!draft.photo) missing.push('la foto');
  if (draft.deadline.trim().length === 0) missing.push('la fecha límite');
  return missing;
}

let questionCounter = 0;

/** Id local para una pregunta nueva. */
export function nextQuestionId(): string {
  questionCounter += 1;
  return `q${questionCounter}`;
}

/** Pregunta vacía lista para editar. */
export function emptyQuestion(): DraftQuestion {
  return { id: nextQuestionId(), label: '', type: 'text', required: true, options: [] };
}
