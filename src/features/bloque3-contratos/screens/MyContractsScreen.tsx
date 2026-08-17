/**
 * Mis contratos — Bloque 3 · Aplicantes y contratos.
 * Endpoints: GET /me/contracts
 *
 * Lista de contratos donde soy contratante o contratado,
 * con filtro por estado (active / inactive).
 */

import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { contractsApi } from '@/api';
import type { Contract, ContractFilterStatus } from '@/api';
import { Card, EmptyState, ErrorMessage, Loader, Screen } from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { ContractsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ContractsStackParamList, 'MyContracts'>;

const FILTERS: { key: ContractFilterStatus; label: string }[] = [
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
];

/* ---- Helpers ---- */

function contractStatusColor(status?: string): string {
  switch (status) {
    case 'active':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'rejected':
    case 'cancelled':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

function contractStatusLabel(status?: string): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status ?? '—';
  }
}

function roleLabel(role?: string): string {
  return role === 'contratante'
    ? 'Contratante'
    : role === 'contratado'
      ? 'Contratado'
      : (role ?? '—');
}

/** Formats ISO dates ignoring local timezone shifts */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/* ---- Screen ---- */

export default function MyContractsScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<ContractFilterStatus>('active');

  const { data, loading, error, reload, refreshing, refresh } = useAsyncData(
    () => contractsApi.getMyContracts({ status: filter }),
    [filter],
  );

  const renderItem = useCallback(
    ({ item }: { item: Contract }) => (
      <Card
        onPress={() =>
          item.id && navigation.navigate('ContractDetail', { contractId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.jobType} numberOfLines={1}>
            {item.jobTypeName ?? 'Contrato'}
          </Text>
          <View
            style={[styles.badge, { backgroundColor: contractStatusColor(item.status) }]}
          >
            <Text style={styles.badgeText}>
              {contractStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="person-outline" size={14} color={colors.textMuted} />
          <Text style={styles.cardValue} numberOfLines={1}>
            {item.myRole === 'contratante'
              ? (item.contratado?.nombre ?? 'Contratado')
              : (item.contratante?.nombre ?? 'Contratante')}
          </Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{roleLabel(item.myRole)}</Text>
          </View>
        </View>

        {item.salary != null && (
          <View style={styles.cardRow}>
            <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
            <Text style={styles.cardValue}>
              {item.currency ?? 'USD'} {item.salary.toLocaleString()}
            </Text>
          </View>
        )}

        {item.startDate && (
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.cardValue}>{formatDate(item.startDate)}</Text>
          </View>
        )}

        <Text style={styles.date}>
          {item.createdAt ? formatDate(item.createdAt) : ''}
        </Text>
      </Card>
    ),
    [navigation],
  );

  if (loading) return <Loader message="Cargando contratos…" />;
  if (error) return <ErrorMessage error={error} onRetry={reload} fullScreen />;

  return (
    <Screen padded={false}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterTab,
              filter === f.key && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

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
            title="Sin contratos"
            message={
              filter === 'active'
                ? 'No tienes contratos activos por el momento.'
                : 'No tienes contratos finalizados o cancelados.'
            }
            icon="document-text-outline"
          />
        }
      />
    </Screen>
  );
}

/* ---- Styles ---- */

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.textInverse,
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
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobType: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textInverse,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  cardValue: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flex: 1,
  },
  rolePill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.disabled,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
