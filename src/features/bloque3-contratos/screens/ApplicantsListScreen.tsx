/**
 * Aplicantes — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /offers/{id}/applications
 *
 * Lista de aplicantes de una oferta (solo el dueño),
 * con su identidad, estado y calificación.
 */

import { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { applicationsApi } from '@/api';
import type { Application } from '@/api';
import { Card, EmptyState, ErrorMessage, Loader, Screen } from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { ContractsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ContractsStackParamList, 'ApplicantsList'>;
type RouteT = RouteProp<ContractsStackParamList, 'ApplicantsList'>;

/* ---- Helpers ---- */

function applicationStatusColor(status?: string): string {
  switch (status) {
    case 'applied':
      return colors.primary;
    case 'finalist':
      return colors.warning;
    case 'winner':
      return colors.success;
    case 'discarded':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

function applicationStatusLabel(status?: string): string {
  switch (status) {
    case 'applied':
      return 'Aplicó';
    case 'finalist':
      return 'Finalista';
    case 'winner':
      return 'Ganador';
    case 'discarded':
      return 'Descartado';
    default:
      return status ?? '—';
  }
}

/** Estrellas de solo lectura para la lista. */
function StarDisplay({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= rating ? 'star' : 'star-outline'}
          size={14}
          color={n <= rating ? colors.accent : colors.disabled}
        />
      ))}
    </View>
  );
}

/* ---- Screen ---- */

export default function ApplicantsListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { offerId } = route.params;

  const { data, loading, error, reload, refreshing, refresh } = useAsyncData(
    () => applicationsApi.getOfferApplications(offerId),
    [offerId],
  );

  const renderItem = useCallback(
    ({ item }: { item: Application }) => (
      <Card
        onPress={() =>
          item.id &&
          navigation.navigate('ApplicantDetail', {
            offerId,
            applicationId: item.id,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.applicantInfo}>
            <Ionicons
              name="person-circle-outline"
              size={36}
              color={colors.primary}
            />
            <View style={styles.nameCol}>
              <Text style={styles.applicantName} numberOfLines={1}>
                {item.applicant?.nombre ?? 'Aplicante'}
              </Text>
              {item.applicant?.email && (
                <Text style={styles.applicantEmail} numberOfLines={1}>
                  {item.applicant.email}
                </Text>
              )}
            </View>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: applicationStatusColor(item.status) },
            ]}
          >
            <Text style={styles.badgeText}>
              {applicationStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {item.comment && (
          <Text style={styles.comment} numberOfLines={2}>
            "{item.comment}"
          </Text>
        )}

        <View style={styles.cardFooter}>
          <StarDisplay rating={item.rating} />
          <Text style={styles.date}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('es-DO')
              : ''}
          </Text>
        </View>
      </Card>
    ),
    [navigation, offerId],
  );

  if (loading) return <Loader message="Cargando aplicantes…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} fullScreen />;

  return (
    <Screen padded={false}>
      {/* Header with count */}
      {data && data.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.headerCount}>
            {data.length} aplicante{data.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={
          data?.length ? styles.listContent : styles.listEmpty
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin aplicantes"
            message="Nadie ha aplicado a esta oferta todavía."
            icon="people-outline"
          />
        }
      />
    </Screen>
  );
}

/* ---- Styles ---- */

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  listEmpty: {
    flexGrow: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  nameCol: {
    flex: 1,
  },
  applicantName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  applicantEmail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
    marginTop: 4,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textInverse,
  },
  comment: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.disabled,
  },
});
