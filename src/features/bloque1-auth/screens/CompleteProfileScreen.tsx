/**
 * Completar perfil · `PUT /me/profile` (Bloque 1).
 *
 * El API pide cédula, género y fecha de nacimiento en el primer inicio de
 * sesión, y no deja publicar ofertas hasta tenerlos (`POST /offers` exige
 * perfil completo). Cuando `profileCompleted` es `false`, esta pantalla es lo
 * único que se ve hasta que se guarde.
 *
 * También sirve para editar los datos después, entrando desde Mi cuenta.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError, GENDERS, type Gender } from '@/api';
import { AppButton, AppInput, Card, ErrorMessage, Screen } from '@/components';
import { useForm } from '@/hooks';
import { useAuth } from '@/store';
import { colors, fontSize, radius, spacing } from '@/theme';
import {
  CEDULA_LENGTH,
  cedula as cedulaRule,
  minLength,
  onlyDigits,
  pastDate,
  required,
} from '@/utils/validation';
import type { AccountStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AccountStackParamList, 'CompleteProfile'>;

const GENDER_LABELS: Record<Gender, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
};

export default function CompleteProfileScreen({ navigation }: Props) {
  const { user, updateProfile, needsProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const [genderError, setGenderError] = useState<string | undefined>();

  const form = useForm({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      cedula: user?.cedula ?? '',
      birthDate: user?.birthDate ? user.birthDate.slice(0, 10) : '',
    },
    rules: {
      firstName: [required('El nombre es obligatorio'), minLength(2, 'Muy corto')],
      lastName: [required('El apellido es obligatorio'), minLength(2, 'Muy corto')],
      cedula: [required('La cédula es obligatoria'), cedulaRule()],
      birthDate: [required('La fecha de nacimiento es obligatoria'), pastDate()],
    },
  });

  const submit = async () => {
    setError(null);
    setGenderError(undefined);

    const validForm = form.validate();
    if (!gender) setGenderError('Elige una opción');
    if (!validForm || !gender) return;

    setSubmitting(true);
    try {
      await updateProfile({
        firstName: form.values.firstName.trim(),
        lastName: form.values.lastName.trim(),
        // El API ignora guiones y espacios, pero se manda limpio igual.
        cedula: onlyDigits(form.values.cedula),
        gender,
        birthDate: form.values.birthDate.trim(),
      });

      // Con el perfil completo, el navegador raíz suelta el resto de la app
      // solo. Si se entró a editar desde Mi cuenta, se vuelve atrás.
      if (!needsProfile) navigation.goBack();
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 422
          ? 'Revisa la cédula, el género y la fecha de nacimiento: alguno no es válido.'
          : caught,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>
          {needsProfile ? 'Completa tu perfil' : 'Mis datos'}
        </Text>
        <Text style={styles.subtitle}>
          {needsProfile
            ? 'Necesitamos estos datos para activar tu cuenta. Sin ellos no podrás publicar ofertas.'
            : 'Actualiza los datos de tu perfil.'}
        </Text>
      </View>

      <ErrorMessage error={error} />

      <AppInput
        label="Nombre"
        required
        placeholder="Juan"
        autoCapitalize="words"
        editable={!submitting}
        {...form.fieldProps('firstName')}
      />

      <AppInput
        label="Apellido"
        required
        placeholder="Pérez"
        autoCapitalize="words"
        editable={!submitting}
        {...form.fieldProps('lastName')}
      />

      <AppInput
        label="Cédula"
        required
        placeholder="40212345678"
        keyboardType="number-pad"
        maxLength={13}
        hint={`${CEDULA_LENGTH} dígitos. Puedes escribirla con guiones.`}
        editable={!submitting}
        {...form.fieldProps('cedula')}
      />

      <View style={styles.field}>
        <Text style={styles.label}>
          Género<Text style={styles.requiredMark}> *</Text>
        </Text>
        <View style={styles.options}>
          {GENDERS.map((option) => {
            const selected = gender === option;
            return (
              <Pressable
                key={option}
                disabled={submitting}
                onPress={() => {
                  setGender(option);
                  setGenderError(undefined);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: submitting }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {GENDER_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {genderError ? <Text style={styles.error}>{genderError}</Text> : null}
      </View>

      <AppInput
        label="Fecha de nacimiento"
        required
        placeholder="2004-05-17"
        keyboardType="numbers-and-punctuation"
        hint="Formato: AAAA-MM-DD"
        editable={!submitting}
        onSubmitEditing={submit}
        returnKeyType="go"
        {...form.fieldProps('birthDate')}
      />

      <AppButton
        title={needsProfile ? 'Activar mi cuenta' : 'Guardar cambios'}
        onPress={submit}
        loading={submitting}
      />

      {needsProfile ? (
        <Card style={styles.note}>
          <View style={styles.noteRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <Text style={styles.noteText}>
              Estos datos se piden una sola vez. Después podrás cambiarlos desde Mi cuenta.
            </Text>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requiredMark: {
    color: colors.danger,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  error: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  note: {
    marginTop: spacing.lg,
  },
  noteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
