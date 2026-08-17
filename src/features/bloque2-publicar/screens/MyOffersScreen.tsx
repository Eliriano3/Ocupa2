/**
 * Mis ofertas — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /me/offers, POST /offers/{id}/deactivate
 *
 * Lista de lo que publiqué, con el estado de cada oferta y la acción de
 * desactivarla. Mientras carga se ven esqueletos, no un spinner; si no hay
 * nada, se ve el estado vacío que invita a publicar.
 */

import { useCallback, useRef, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ApiError, offersApi, type Offer } from '@/api';
import {
  AppButton,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Screen,
  errorToMessage,
} from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import { SkeletonList, Snackbar } from '../components';
import { CONTRACT_TYPE_LABELS } from '../constants';
import { formatDate, formatMoney } from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'MyOffers'>;

export default function MyOffersScreen() {
  const navigation = useNavigation<Navigation>();

  const loadOffers = useCallback(() => offersApi.getMyOffers(), []);
  const { data: offers, loading, error, reload, refreshing, refresh } = useAsyncData(
    loadOffers,
    [loadOffers],
  );

  /** Oferta que se está por desactivar (la confirmación pide sí o no). */
  const [pendingOffer, setPendingOffer] = useState<Offer | null>(null);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Al volver de publicar, la lista tiene que traer la oferta nueva. La primera
  // vez no: de esa se encarga `useAsyncData` al montar, y pedirla dos veces
  // haría parpadear la pantalla.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void refresh();
      // `refresh` cambia de identidad en cada render; solo interesa al enfocar.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  async function deactivate(offer: Offer) {
    if (!offer.id) return;

    setWorking(true);
    setActionError(null);

    try {
      await offersApi.deactivateOffer(offer.id);
      setNotice('Oferta desactivada. Ya no aparece en la búsqueda.');
      await refresh();
    } catch (caught) {
      // 409 = ya estaba desactivada; no es un fallo que valga la pena dramatizar.
      setActionError(
        caught instanceof ApiError && caught.status === 409
          ? 'Esa oferta ya estaba desactivada.'
          : errorToMessage(caught),
      );
    } finally {
      setWorking(false);
      setPendingOffer(null);
    }
  }

  /* -------------------------------- Estados ------------------------------- */

  if (loading && !offers) {
    return (
      <Screen>
        <SkeletonList rows={3} />
      </Screen>
    );
  }

  if (error && !offers) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={reload} fullScreen />
      </Screen>
    );
  }

  if (offers && offers.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="clipboard-outline"
          title="Aún no has publicado"
          message="Publicar cuesta US$1 y tu oferta aparece en la lista y en el mapa al instante."
          actionLabel="Publicar mi primera oferta"
          onAction={() => navigation.navigate('PublishOffer')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      {actionError ? (
        <View style={styles.actionError}>
          <ErrorMessage error={actionError} />
        </View>
      ) : null}

      <FlatList
        data={offers ?? []}
        keyExtractor={(offer, index) => offer.id ?? `oferta-${index}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        renderItem={({ item }) => {
          const active = item.active !== false;

          return (
            <Card style={styles.card}>
              <View style={styles.cardHead}>
                <View style={[styles.badge, active ? styles.badgeOn : styles.badgeOff]}>
                  <Text style={[styles.badgeText, active ? styles.badgeTextOn : styles.badgeTextOff]}>
                    {active ? 'Activa' : 'Desactivada'}
                  </Text>
                </View>
                <Text style={styles.date}>Cierra el {formatDate(item.deadline)}</Text>
              </View>

              <View style={styles.cardBody}>
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Ionicons name="image-outline" size={20} color={colors.disabled} />
                  </View>
                )}

                <View style={styles.cardText}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.jobTypeName ?? item.jobTypeKey ?? 'Oferta'}
                  </Text>
                  <Text style={styles.meta}>
                    {item.contractType ? CONTRACT_TYPE_LABELS[item.contractType] : '—'} ·{' '}
                    {formatMoney(item.payment?.amount, item.payment?.currency)}
                  </Text>
                  <Text style={styles.meta}>
                    {item.applicationsCount ?? 0} aplicaciones · {item.likesCount ?? 0} me gusta
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <AppButton
                  title="Ver aplicantes"
                  onPress={() =>
                    navigation.navigate('ContractsTab' as never, {
                      screen: 'ApplicantsList',
                      params: { offerId: item.id },
                    } as never)
                  }
                  fullWidth={false}
                  disabled={working}
                />
                {active ? (
                  <AppButton
                    title="Desactivar"
                    onPress={() => setPendingOffer(item)}
                    variant="secondary"
                    fullWidth={false}
                    disabled={working}
                  />
                ) : null}
              </View>
            </Card>
          );
        }}
      />

      <View style={styles.footer}>
        <AppButton title="Publicar otra oferta" onPress={() => navigation.navigate('PublishOffer')} />
      </View>

      <ConfirmDialog
        visible={pendingOffer !== null}
        title="Desactivar la oferta"
        message="Deja de aparecer en la búsqueda y en el mapa, y nadie más podrá aplicar. Las aplicaciones que ya recibiste se mantienen."
        confirmLabel="Desactivar"
        destructive
        onConfirm={() => {
          if (pendingOffer) void deactivate(pendingOffer);
        }}
        onCancel={() => setPendingOffer(null)}
      />

      <Snackbar message={notice} onHide={() => setNotice(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
  actionError: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  badgeOn: {
    backgroundColor: colors.successSoft,
  },
  badgeOff: {
    backgroundColor: colors.background,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  badgeTextOn: {
    color: colors.success,
  },
  badgeTextOff: {
    color: colors.textMuted,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  cardBody: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
