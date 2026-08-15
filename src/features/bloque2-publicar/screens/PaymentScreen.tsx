/**
 * Pagar publicación — Bloque 2 · Publicar y pagos.
 * Endpoints: POST /payments, POST /offers
 *
 * Cobro simulado de 1 USD y, con el pago aprobado, la creación de la oferta en
 * la misma acción: el API exige un `paymentId` aprobado, así que separarlos
 * dejaría pagos huérfanos.
 *
 * Contra el cobro doble: si el pago ya salió bien y lo que falló fue
 * `POST /offers`, el `paymentId` queda guardado en el borrador y al reintentar
 * NO se vuelve a cobrar — se reusa el pago que ya está aprobado.
 *
 * Tarjetas de prueba: aprobada 4242 4242 4242 4242, rechazada 4000 0000 0000 0002.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ApiError, offersApi, paymentsApi } from '@/api';
import { AppButton, AppInput, EmptyState, Screen, errorToMessage } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
import { SavedCardList, StepFooter, SummaryRow, WizardLayout } from '../components';
import { CARD_MAX_DIGITS, CONTRACT_TYPE_LABELS, PUBLISH_PRICE_USD } from '../constants';
import {
  isExpired,
  loadSavedCards,
  removeSavedCard,
  saveCard,
  type SavedCard,
} from '../services/savedCards';
import { missingFields, toOfferInput, usePublishDraft } from '../state/PublishDraftContext';
import {
  formatCardNumber,
  formatDate,
  formatExpiry,
  formatMoney,
  onlyDigits,
  parseAmount,
  parseExpiry,
  validateCardNumber,
  validateCvv,
  validateExpiry,
} from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation<Navigation>();
  const { draft, patch, reset } = usePublishDraft();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('');

  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  }>({});

  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<unknown>(null);

  /* --------------------------- Tarjetas guardadas -------------------------- */

  const [cards, setCards] = useState<SavedCard[]>([]);
  /** Tarjeta recordada en uso, o `null` si se está escribiendo una nueva. */
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    let alive = true;

    void loadSavedCards().then((saved) => {
      if (!alive) return;
      setCards(saved);

      // La más reciente que siga vigente queda elegida de entrada.
      const usable = saved.find((card) => !isExpired(card));
      if (usable) applyCard(usable);
    });

    return () => {
      alive = false;
    };
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Rellena el formulario con una tarjeta recordada. El CVV queda vacío a
   * propósito: nunca se guarda, así que siempre hay que teclearlo.
   */
  function applyCard(card: SavedCard) {
    setSelectedCard(card.id);
    setCardNumber(formatCardNumber(card.number));
    setExpiry(`${`${card.expMonth}`.padStart(2, '0')}/${`${card.expYear}`.slice(-2)}`);
    setCardholder(card.cardholder ?? '');
    setCvv('');
    setErrors({});
  }

  /** Vuelve al formulario en blanco para escribir una tarjeta nueva. */
  function clearCard() {
    setSelectedCard(null);
    setCardNumber('');
    setExpiry('');
    setCardholder('');
    setCvv('');
    setErrors({});
  }

  async function forgetCard(card: SavedCard) {
    const next = await removeSavedCard(card.id);
    setCards(next);
    if (selectedCard === card.id) clearCard();
  }

  /** Mientras se cobra no se puede volver atrás: evita cobrar dos veces. */
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !sending,
      headerBackVisible: !sending,
    });
  }, [navigation, sending]);

  const pending = missingFields(draft);

  /* ------------------------------- Guardia ------------------------------- */

  if (pending.length > 0) {
    return (
      <Screen>
        <EmptyState
          icon="document-text-outline"
          title="La oferta está incompleta"
          message={`Antes de pagar falta ${pending.join(', ')}.`}
          actionLabel="Volver al formulario"
          onAction={() => navigation.navigate('PublishOffer')}
        />
      </Screen>
    );
  }

  /* -------------------------------- Cobro -------------------------------- */

  async function submit() {
    // Con el pago ya aprobado no se piden los datos de la tarjeta otra vez.
    if (!draft.paymentId) {
      const found = {
        cardNumber: validateCardNumber(cardNumber),
        expiry: validateExpiry(expiry),
        cvv: validateCvv(cvv),
      };
      setErrors(found);
      if (Object.values(found).some(Boolean)) return;
    }

    setSending(true);
    setFailure(null);

    try {
      let paymentId = draft.paymentId;

      if (!paymentId) {
        const parsed = parseExpiry(expiry);
        if (!parsed) throw new Error('Vencimiento no válido (MM/AA)');

        const payment = await paymentsApi.createPayment({
          cardNumber: onlyDigits(cardNumber),
          cvv: onlyDigits(cvv),
          expMonth: parsed.month,
          expYear: parsed.year,
          ...(cardholder.trim().length > 0 ? { cardholder: cardholder.trim() } : {}),
        });

        if (!payment.id) {
          throw new Error('El pago se procesó pero no devolvió un identificador.');
        }

        paymentId = payment.id;
        // Se guarda de inmediato: si `POST /offers` falla, el reintento lo reusa.
        patch({ paymentId });

        // Solo se recuerda una tarjeta que la pasarela aceptó, y solo si el
        // usuario lo pidió. El CVV no entra: se pide siempre.
        if (remember && selectedCard === null) {
          setCards(
            await saveCard({
              number: cardNumber,
              expMonth: parsed.month,
              expYear: parsed.year,
              cardholder: cardholder.trim() || undefined,
            }),
          );
        }
      }

      const offer = await offersApi.createOffer(toOfferInput(draft, paymentId));

      reset();
      navigation.replace('OfferPublished', { offerId: offer.id ?? '' });
    } catch (caught) {
      setFailure(caught);
    } finally {
      setSending(false);
    }
  }

  /* -------------------------------- Render ------------------------------- */

  const declined = failure instanceof ApiError && failure.status === 402;
  const alreadyPaid = Boolean(draft.paymentId);

  return (
    <Screen padded={false}>
      <WizardLayout
        footer={
          <StepFooter
            label={
              sending
                ? 'Procesando…'
                : alreadyPaid
                  ? 'Reintentar publicación'
                  : `Pagar US$${PUBLISH_PRICE_USD} y publicar`
            }
            onPress={() => void submit()}
            loading={sending}
            hint={sending ? 'No cierres la app ni vuelvas atrás.' : undefined}
          />
        }
      >
        <View style={styles.summary}>
          <SummaryRow label="Publicación de oferta" value={`US$${PUBLISH_PRICE_USD}`} />
          <SummaryRow label="Tipo de trabajo" value={draft.jobTypeName || '—'} />
          <SummaryRow label="Contrato" value={CONTRACT_TYPE_LABELS[draft.contractType]} />
          <SummaryRow
            label="Pago al trabajador"
            value={formatMoney(parseAmount(draft.amount), draft.currency)}
          />
          <SummaryRow label="Activa hasta" value={formatDate(draft.deadline)} />
          <SummaryRow label="Total" value={`US$${PUBLISH_PRICE_USD}`} strong last />
        </View>

        {failure ? (
          <View style={styles.banner}>
            <Ionicons
              name={declined ? 'card-outline' : 'alert-circle-outline'}
              size={20}
              color={colors.danger}
            />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                {declined ? 'No se pudo cobrar la tarjeta' : 'No se pudo publicar'}
              </Text>
              <Text style={styles.bannerBody}>
                {declined
                  ? 'El banco rechazó el pago. Tu oferta sigue guardada: no se publicó ni se cobró nada. Prueba con otra tarjeta.'
                  : errorToMessage(failure)}
              </Text>
              {alreadyPaid ? (
                <Text style={styles.bannerNote}>
                  El pago ya está aprobado. Al reintentar no se te cobra de nuevo.
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {alreadyPaid ? (
          <View style={styles.paidBox}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.paidText}>
              Pago aprobado. Solo falta crear la oferta.
            </Text>
          </View>
        ) : (
          <>
            <SavedCardList
              cards={cards}
              selectedId={selectedCard}
              onSelect={applyCard}
              onRemove={(card) => void forgetCard(card)}
              onUseAnother={clearCard}
              disabled={sending}
            />

            <AppInput
              label="Número de tarjeta"
              required
              value={cardNumber}
              onChangeText={(value) => {
                setCardNumber(formatCardNumber(value));
                setSelectedCard(null);
                setErrors((current) => ({ ...current, cardNumber: undefined }));
              }}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              // 16 dígitos más los 3 espacios que agrega el formato.
              maxLength={CARD_MAX_DIGITS + 3}
              editable={!sending}
              error={errors.cardNumber}
              hint="Prueba con 4242 4242 4242 4242 (aprobada) o 4000 0000 0000 0002 (rechazada)."
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  label="Vence"
                  required
                  value={expiry}
                  onChangeText={(value) => {
                    setExpiry(formatExpiry(value));
                    setErrors((current) => ({ ...current, expiry: undefined }));
                  }}
                  placeholder="09/29"
                  keyboardType="number-pad"
                  maxLength={5}
                  editable={!sending}
                  error={errors.expiry}
                />
              </View>

              <View style={styles.half}>
                <AppInput
                  label="CVV"
                  required
                  value={cvv}
                  onChangeText={(value) => {
                    setCvv(onlyDigits(value).slice(0, 4));
                    setErrors((current) => ({ ...current, cvv: undefined }));
                  }}
                  placeholder="123"
                  keyboardType="number-pad"
                  maxLength={4}
                  editable={!sending}
                  error={errors.cvv}
                />
              </View>
            </View>

            <AppInput
              label="Nombre en la tarjeta"
              value={cardholder}
              onChangeText={setCardholder}
              placeholder="Luis A. Mercedes"
              autoCapitalize="words"
              editable={!sending}
              hint="Opcional."
            />

            {selectedCard === null ? (
              <View style={styles.rememberRow}>
                <View style={styles.rememberText}>
                  <Text style={styles.rememberLabel}>Recordar esta tarjeta</Text>
                  <Text style={styles.rememberHelp}>
                    Para no volver a teclearla. El CVV se pide igual cada vez.
                  </Text>
                </View>
                <Switch
                  value={remember}
                  onValueChange={setRemember}
                  disabled={sending}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
            ) : null}
          </>
        )}

        <View style={styles.legal}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
          <Text style={styles.legalText}>
            El CVV nunca se guarda. Si recuerdas una tarjeta, queda cifrada en este teléfono y no
            sale de él. Se cobra una sola vez por oferta publicada.
          </Text>
        </View>

        <AppButton
          title="Ver mis pagos"
          onPress={() => navigation.navigate('MyPayments')}
          variant="ghost"
          disabled={sending}
        />
      </WizardLayout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  bannerBody: {
    fontSize: fontSize.sm,
    color: colors.danger,
    lineHeight: 20,
  },
  bannerNote: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  paidBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
  },
  paidText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rememberText: {
    flex: 1,
  },
  rememberLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rememberHelp: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  legal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legalText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
