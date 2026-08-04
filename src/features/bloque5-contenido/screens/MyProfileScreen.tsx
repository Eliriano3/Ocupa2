/*
 * ----- MI PERFIL -----
 * Pantalla de perfil del usuario autenticado.
 * Muestra los datos de la cuenta y permite acceder a la sección de experiencias.
 * La edición de datos personales se gestiona desde la sección de cuenta.
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
 
import { profileApi } from '@/api';
import type { User } from '@/api/types';
import { AppButton, Card, EmptyState, Loader, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
 
import type { ContentStackParamList } from '../navigation/types';
 
type Navigation = NativeStackNavigationProp<ContentStackParamList>;
 
function formatDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
export default function MyProfileScreen() {
  const navigation = useNavigation<Navigation>();
 
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await profileApi.getMe();
      setUser(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
 
  if (loading) {
    return (
      <Screen>
        <Loader message="Cargando tu perfil..." />
      </Screen>
    );
  }
 
  if (errorMessage || !user) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudo cargar tu perfil"
          message={errorMessage ?? undefined}
          actionLabel="Reintentar"
          onAction={loadProfile}
        />
      </Screen>
    );
  }
 
  const displayName = user.nombre ?? [user.firstName, user.lastName].filter(Boolean).join(' ');
 
  return (
    <Screen scroll>
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.primary} />
        </View>
 
        <Text style={styles.name}>{displayName || 'Sin nombre registrado'}</Text>
        {user.email ? <Text style={styles.email}>{user.email}</Text> : null}
 
        <View style={styles.divider} />
 
        {user.referralMatricula ? (
          <InfoRow label="Matrícula de referido" value={user.referralMatricula} />
        ) : null}
        {user.role ? <InfoRow label="Rol" value={user.role} /> : null}
        {user.createdAt ? (
          <InfoRow label="Miembro desde" value={formatDate(user.createdAt)} />
        ) : null}
        {user.lastLoginAt ? (
          <InfoRow label="Última conexión" value={formatDate(user.lastLoginAt)} />
        ) : null}
      </Card>
 
      <AppButton
        title="Mis experiencias"
        onPress={() => navigation.navigate('Experiences')}
        style={styles.experiencesButton}
      />
    </Screen>
  );
}
 
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  experiencesButton: {
    marginTop: spacing.lg,
  },
});
 