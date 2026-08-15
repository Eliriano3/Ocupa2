/**
 * Rutas del Bloque 2 · Publicar y pagos.
 * Agrega aquí las pantallas nuevas de tu bloque: este archivo es solo tuyo.
 *
 * El asistente son cuatro pantallas seguidas (`PublishOffer` → `OfferLocation`
 * → `OfferPhoto` → `OfferQuestions`) que comparten el borrador de
 * `PublishDraftProvider`; por eso ninguna necesita parámetros.
 */

export type PublishStackParamList = {
  /** Paso 1 · detalles del trabajo. */
  PublishOffer: undefined;
  /** Paso 2 · ubicación en el mapa y dirección. */
  OfferLocation: undefined;
  /** Paso 3 · foto obligatoria y fecha límite. */
  OfferPhoto: undefined;
  /** Paso 4 · preguntas para el aplicante. */
  OfferQuestions: undefined;
  /** Cobro de US$1 y creación de la oferta. */
  Payment: undefined;
  /** Confirmación. `offerId` viene de la respuesta de `POST /offers`. */
  OfferPublished: { offerId: string };
  MyPayments: undefined;
  MyOffers: undefined;
};
