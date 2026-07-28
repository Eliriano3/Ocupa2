/**
 * Mi cuenta · `GET /me` (Bloque 1).
 *
 * Muestra los datos de la cuenta autenticada y da acceso a cambiar la clave y
 * cerrar sesión. El perfil ampliado y las experiencias son del Bloque 5.
 */

import { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton, Card, ErrorMessage, Loader, Screen } from '@/components';
import { useAuth } from '@/store';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { AccountStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AccountStackParamList, 'Account'>;

export default function AccountScreen({ navigation }: Props) {
  const { user, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshProfile();
    } catch (caught) {
      setError(caught);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  if (!user) return <Loader message="Cargando tu cuenta…" />;

  const fullName = user.nombre ?? [user.firstName, user.lastName].filter(Boolean).join(' ');
  const initials = (fullName || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <Screen
      scroll
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName || 'Sin nombre'}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <ErrorMessage error={error} onRetry={refresh} />

      <Card>
        <Row label="Nombre" value={user.firstName} />
        <Row label="Apellido" value={user.lastName} />
        <Row label="Correo" value={user.email} />
        <Row label="Matrícula de referido" value={user.referralMatricula} />
        <Row label="Rol" value={user.role} />
        <Row label="Último acceso" value={formatDate(user.lastLoginAt)} last />
      </Card>

      <AppButton
        title="Cambiar clave"
        variant="secondary"
        onPress={() => navigation.navigate('ChangePassword')}
      />

      <AppButton
        title="Cerrar sesión"
        variant="danger"
        onPress={confirmLogout}
        style={styles.spaced}
      />

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.noteText}>
          Tu sesión queda guardada en el teléfono: no tendrás que entrar de nuevo cada vez que
          abras la app.
        </Text>
      </View>
    </Screen>
  );
}

function Row({ label, value, last }: { label: string; value?: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value?.trim() ? value : '—'}</Text>
    </View>
  );
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textInverse,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  rowValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  spaced: {
    marginTop: spacing.sm,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingRight: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
