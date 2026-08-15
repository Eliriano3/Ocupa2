/**
 * Versión web de `OfferMapPicker`. `react-native-maps` no corre en el
 * navegador, así que aquí se muestra un panel con las coordenadas y el botón
 * para tomarlas del navegador; el ajuste fino se hace en el celular.
 *
 * Mismo contrato de props que la versión nativa: quien la usa no cambia nada.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { GeoLocation } from '@/api/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { MAP_HEIGHT, TOUCH_TARGET } from '../constants';

export interface OfferMapPickerProps {
  value: GeoLocation | null;
  onChange: (location: GeoLocation) => void;
  onUseMyLocation: () => void;
  locating?: boolean;
}

export function OfferMapPicker({ value, onUseMyLocation, locating = false }: OfferMapPickerProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={32} color={colors.disabled} />

      <Text style={styles.title}>
        {value ? 'Ubicación tomada' : 'El mapa solo funciona en el celular'}
      </Text>

      <Text style={styles.body}>
        {value
          ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
          : 'Usa el botón para tomar la ubicación del navegador; en el APK podrás arrastrar el mapa.'}
      </Text>

      <Pressable
        onPress={onUseMyLocation}
        disabled={locating}
        accessibilityRole="button"
        accessibilityLabel="Usar mi ubicación"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="locate" size={18} color={colors.primary} />
        <Text style={styles.buttonLabel}>
          {locating ? 'Buscando…' : 'Usar mi ubicación'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});
