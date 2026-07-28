/**
 * Pantalla placeholder para los bloques que todavía no están implementados.
 *
 * Muestra de quién es la pantalla, qué endpoints le tocan y qué falta hacer,
 * y deja botones para saltar a las otras pantallas del mismo stack (así se
 * puede navegar el flujo antes de que exista la lógica).
 *
 * Cuando implementes la pantalla, borra el componente y escribe la real.
 */

import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '@/theme';
import { Card } from './Card';
import { Screen } from './Screen';

export interface PlaceholderScreenProps {
  /** Ej. "Bloque 2 · Publicar y pagos". */
  block: string;
  /** Integrante responsable. */
  owner?: string;
  /** Nombre de la pantalla, ej. "Publicar oferta". */
  screen: string;
  /** Endpoints que consume, ej. `['POST /offers', 'GET /job-types']`. */
  endpoints?: string[];
  /** Qué falta hacer aquí. */
  todo: string;
  /** Detalles adicionales (reglas de negocio, errores a manejar, etc.). */
  notes?: string[];
}

export function PlaceholderScreen({
  block,
  owner,
  screen,
  endpoints = [],
  todo,
  notes = [],
}: PlaceholderScreenProps) {
  const navigation = useNavigation();
  const state = navigation.getState();
  const currentRoute = state ? state.routes[state.index]?.name : undefined;
  const siblings = (state?.routeNames ?? []).filter((name) => name !== currentRoute);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={32} color={colors.accent} />
        <Text style={styles.block}>{block}</Text>
        <Text style={styles.title}>{screen}</Text>
        {owner ? <Text style={styles.owner}>Responsable: {owner}</Text> : null}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Pendiente</Text>
        <Text style={styles.text}>{todo}</Text>

        {notes.length > 0 ? (
          <View style={styles.notes}>
            {notes.map((note) => (
              <Text key={note} style={styles.note}>
                • {note}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>

      {endpoints.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Endpoints</Text>
          {endpoints.map((endpoint) => (
            <Text key={endpoint} style={styles.endpoint}>
              {endpoint}
            </Text>
          ))}
          <Text style={styles.hint}>
            Ya están tipados en `src/api`. No hace falta escribir fetch a mano.
          </Text>
        </Card>
      ) : null}

      {siblings.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Otras pantallas de este bloque</Text>
          {siblings.map((name) => (
            <Text
              key={name}
              style={styles.link}
              // `as never` es el escape estándar de React Navigation cuando se
              // navega por nombre dinámico, sin conocer el ParamList en tiempo de compilación.
              onPress={() => navigation.navigate(name as never)}
            >
              → {name}
            </Text>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  block: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  owner: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  notes: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  note: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  endpoint: {
    fontFamily: 'monospace',
    fontSize: fontSize.xs,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  link: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    paddingVertical: spacing.xs,
  },
});
