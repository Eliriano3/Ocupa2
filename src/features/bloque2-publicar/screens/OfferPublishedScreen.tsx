/**
 * Oferta publicada — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /offers/{id}
 *
 * Confirmación del final del flujo. Vuelve a leer la oferta del API para
 * mostrar su estado real (activa, aplicaciones) en vez de repetir lo que el
 * usuario acaba de escribir.
 */

import { useCallback } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type RouteProp, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { offersApi } from '@/api';
import { AppButton, ErrorMessage, Screen } from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import { SkeletonList, SummaryRow } from '../components';
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_UNITS,
  DISPLAY_FONT_SIZE,
  PUBLISH_PRICE_USD,
} from '../constants';
import { formatDate, formatMoney } from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'OfferPublished'>;
type Route = RouteProp<PublishStackParamList, 'OfferPublished'>;

export default function OfferPublishedScreen() {
  const navigation = useNavigation<Navigation>();
  const { offerId } = useRoute<Route>().params;

  const loadOffer = useCallback(
    () => (offerId ? offersApi.getOffer(offerId) : Promise.resolve(null)),
    [offerId],
  );
  const { data: offer, loading, error, reload } = useAsyncData(loadOffer, [loadOffer]);

  const share = async () => {
    const title = offer?.jobTypeName ?? 'mi oferta';
    try {
      await Share.share({
        message: `Publiqué una oferta de trabajo en Ocupa2: ${title}. Descarga la app y aplica.`,
      });
    } catch {
      // Compartir es opcional: si el sistema lo cancela, no hay nada que avisar.
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="checkmark-circle" size={48} color={colors.textInverse} />
          <Text style={styles.heroTitle}>OFERTA{'\n'}PUBLICADA</Text>
          <Text style={styles.heroBody}>
            Ya es visible en la lista y en el mapa para los trabajadores cercanos.
          </Text>
        </View>

        <View style={styles.body}>
          {loading && !offer ? (
            <SkeletonList rows={3} />
          ) : error ? (
            <ErrorMessage error={error} onRetry={reload} />
          ) : offer ? (
            <>
              <SummaryRow label="Oferta" value={offer.jobTypeName ?? offer.jobTypeKey ?? '—'} />
              <SummaryRow
                label="Pago"
                value={
                  offer.payment
                    ? `${formatMoney(offer.payment.amount, offer.payment.currency)} · ${
                        offer.contractType ? CONTRACT_TYPE_UNITS[offer.contractType] : ''
                      }`.trim()
                    : '—'
                }
              />
              <SummaryRow
                label="Contrato"
                value={offer.contractType ? CONTRACT_TYPE_LABELS[offer.contractType] : '—'}
              />
              <SummaryRow label="Aplicaciones hasta" value={formatDate(offer.deadline)} />
              <SummaryRow label="Recibo" value={`US$${PUBLISH_PRICE_USD}`} last />

              <View style={styles.statusRow}>
                <View
                  style={[styles.dot, offer.active === false ? styles.dotOff : styles.dotOn]}
                />
                <Text style={styles.statusText}>
                  {offer.active === false
                    ? 'La oferta está desactivada.'
                    : `Activa · ${offer.applicationsCount ?? 0} aplicaciones hasta ahora.`}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.fallback}>
              La oferta se creó, pero no pudimos leer su detalle. Búscala en «Mis ofertas».
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/*
          `reset` en vez de `replace`: el asistente ya cumplió y no tiene sentido
          poder volver atrás a un formulario que quedó vacío.
        */}
        <AppButton
          title="Ver mis ofertas"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MyOffers' }] })}
        />
        <AppButton title="Compartir oferta" onPress={() => void share()} variant="secondary" />
        <AppButton
          title="Publicar otra"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PublishOffer' }] })}
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  heroTitle: {
    fontSize: DISPLAY_FONT_SIZE,
    lineHeight: DISPLAY_FONT_SIZE + 2,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.textInverse,
  },
  heroBody: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textInverse,
    opacity: 0.92,
  },
  body: {
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  dotOn: {
    backgroundColor: colors.success,
  },
  dotOff: {
    backgroundColor: colors.disabled,
  },
  statusText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  fallback: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
