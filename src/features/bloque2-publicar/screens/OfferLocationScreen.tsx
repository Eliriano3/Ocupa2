/**
 * Paso 2 de 4 · Ubicación — Bloque 2 · Publicar y pagos.
 * Servicios: `getCurrentLocation()` y `getAddressFromLocation()`.
 *
 * El mapa fija `location` (lat/lng) y la dirección escrita va en `address`.
 * Las dos son obligatorias para `POST /offers`.
 *
 * Si el usuario niega el permiso de ubicación no se queda trancado: puede
 * escribir la dirección a mano y seguir, tal como pide el checklist del spec.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppInput, ErrorMessage, Screen } from '@/components';
import { getAddressFromLocation, getCurrentLocation } from '@/services';
import { colors, fontSize, radius, spacing } from '@/theme';
import { FieldShell, OfferMapPicker, StepFooter, WizardLayout } from '../components';
import { usePublishDraft } from '../state/PublishDraftContext';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'OfferLocation'>;

export default function OfferLocationScreen() {
  const navigation = useNavigation<Navigation>();
  const { draft, patch } = usePublishDraft();

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<unknown>(null);
  const [addressError, setAddressError] = useState<string | undefined>();

  /** Al entrar se intenta ubicar solo una vez; si falla, se sigue a mano. */
  useEffect(() => {
    if (draft.location) return;
    void locate({ silent: true });
    // Solo al montar: después manda el botón.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function locate({ silent = false }: { silent?: boolean } = {}) {
    setLocating(true);
    setLocationError(null);

    try {
      const coords = await getCurrentLocation();
      patch({ location: coords });

      // La dirección escrita manda: solo se rellena si está vacía.
      if (draft.address.trim().length === 0) {
        const address = await getAddressFromLocation(coords);
        if (address) {
          patch({ address });
          setAddressError(undefined);
        }
      }
    } catch (caught) {
      // Al entrar, un permiso negado no es un error que valga un cartel rojo:
      // el usuario puede escribir la dirección y seguir.
      if (!silent) setLocationError(caught);
    } finally {
      setLocating(false);
    }
  }

  const goNext = () => {
    if (draft.address.trim().length === 0) {
      setAddressError('La dirección es obligatoria');
      return;
    }
    setAddressError(undefined);
    navigation.navigate('OfferPhoto');
  };

  const { location } = draft;

  return (
    <Screen padded={false}>
      <WizardLayout step={2} footer={<StepFooter label="Continuar" onPress={goNext} />}>
        <OfferMapPicker
          value={location}
          onChange={(coords) => patch({ location: coords })}
          onUseMyLocation={() => void locate()}
          locating={locating}
        />

        {locationError ? (
          <View style={styles.errorBlock}>
            <ErrorMessage error={locationError} onRetry={() => void locate()} />
            <Text style={styles.errorHelp}>
              También puedes escribir la dirección a mano y seguir sin el GPS.
            </Text>
          </View>
        ) : null}

        <View style={styles.coordsRow}>
          <Ionicons name="navigate-outline" size={16} color={colors.textMuted} />
          <Text style={styles.coords}>
            {location
              ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'Sin coordenadas todavía'}
          </Text>
        </View>

        <AppInput
          label="Dirección"
          required
          value={draft.address}
          onChangeText={(address) => {
            patch({ address });
            setAddressError(undefined);
          }}
          placeholder="Av. John F. Kennedy 32, Ensanche Naco, Santo Domingo"
          error={addressError}
          hint="Es lo que ve el trabajador junto al mapa."
          multiline
        />

        <FieldShell label="Quién ve tu identidad">
          <View style={styles.notice}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colors.primary}
              style={styles.noticeIcon}
            />
            <Text style={styles.noticeText}>
              Tu nombre queda oculto mientras la oferta está abierta. Solo lo ve el aplicante
              que elijas como ganador.
            </Text>
          </View>
        </FieldShell>
      </WizardLayout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorBlock: {
    marginTop: spacing.md,
  },
  errorHelp: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  coords: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
  },
  noticeIcon: {
    marginTop: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.primaryDark,
    lineHeight: 18,
  },
});
