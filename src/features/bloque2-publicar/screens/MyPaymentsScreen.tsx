/**
 * Mis pagos — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /me/payments
 *
 * Historial de los cobros de US$1. Marca cuáles ya se usaron para publicar y
 * cuáles quedaron aprobados sin usar: esos se pueden aprovechar en la próxima
 * oferta sin volver a pagar.
 */

import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { paymentsApi, type Payment } from '@/api';
import { AppButton, Card, EmptyState, ErrorMessage, Screen } from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import { SkeletonList } from '../components';
import { formatDate, formatMoney } from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'MyPayments'>;

/** `status` del API → cómo se ve la etiqueta. */
function toneFor(status?: string): 'ok' | 'bad' | 'neutral' {
  const value = (status ?? '').toLowerCase();
  if (['approved', 'aprobado', 'succeeded', 'paid'].includes(value)) return 'ok';
  if (['declined', 'rechazado', 'failed'].includes(value)) return 'bad';
  return 'neutral';
}

export default function MyPaymentsScreen() {
  const navigation = useNavigation<Navigation>();

  const loadPayments = useCallback(() => paymentsApi.getMyPayments(), []);
  const { data: payments, loading, error, reload, refreshing, refresh } = useAsyncData(
    loadPayments,
    [loadPayments],
  );

  if (loading && !payments) {
    return (
      <Screen>
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (error && !payments) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={reload} fullScreen />
      </Screen>
    );
  }

  if (payments && payments.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="card-outline"
          title="Todavía no has pagado nada"
          message="Cada oferta publicada cuesta US$1. Aquí aparecerá el historial de tus cobros."
          actionLabel="Publicar una oferta"
          onAction={() => navigation.navigate('PublishOffer')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={payments ?? []}
        keyExtractor={(payment: Payment, index) => payment.id ?? `pago-${index}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Un pago aprobado sin usar sirve para tu próxima oferta: no se cobra dos veces.
          </Text>
        }
        renderItem={({ item }) => {
          const tone = toneFor(item.status);

          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Ionicons
                  name={tone === 'ok' ? 'checkmark-circle' : tone === 'bad' ? 'close-circle' : 'time-outline'}
                  size={22}
                  color={
                    tone === 'ok' ? colors.success : tone === 'bad' ? colors.danger : colors.textMuted
                  }
                />

                <View style={styles.text}>
                  <Text style={styles.amount}>
                    {formatMoney(item.amount, item.currency ?? 'USD')}
                  </Text>
                  <Text style={styles.meta}>
                    {item.last4 ? `Tarjeta •••• ${item.last4}` : 'Tarjeta'} ·{' '}
                    {formatDate(item.createdAt)}
                  </Text>
                  {item.cardholder ? (
                    <Text style={styles.meta}>{item.cardholder}</Text>
                  ) : null}
                </View>

                <View style={[styles.badge, item.used ? styles.badgeUsed : styles.badgeFree]}>
                  <Text
                    style={[
                      styles.badgeText,
                      item.used ? styles.badgeTextUsed : styles.badgeTextFree,
                    ]}
                  >
                    {item.used ? 'Usado' : 'Disponible'}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <View style={styles.footer}>
        <AppButton
          title="Publicar una oferta"
          onPress={() => navigation.navigate('PublishOffer')}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
  },
  intro: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  card: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  badgeUsed: {
    backgroundColor: colors.background,
  },
  badgeFree: {
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  badgeTextUsed: {
    color: colors.textMuted,
  },
  badgeTextFree: {
    color: colors.success,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
