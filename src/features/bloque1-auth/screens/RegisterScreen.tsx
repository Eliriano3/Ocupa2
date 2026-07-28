/**
 * Registro · `POST /auth/register` (Bloque 1).
 *
 * Devuelve el token, así que al crear la cuenta el usuario queda logueado.
 * Errores que hay que explicar bien:
 *   409 → el correo ya está registrado
 *   422 → la matrícula de referido no es válida
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError } from '@/api';
import { AppButton, AppInput, ErrorMessage, Screen } from '@/components';
import { useForm } from '@/hooks';
import { useAuth } from '@/store';
import { colors, fontSize, spacing } from '@/theme';
import {
  digitsOnly,
  email as emailRule,
  password as passwordRule,
  required,
} from '@/utils/validation';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralMatricula: '',
    },
    rules: {
      firstName: [required('El nombre es obligatorio')],
      lastName: [required('El apellido es obligatorio')],
      email: [required('El correo es obligatorio'), emailRule()],
      password: [passwordRule()],
      confirmPassword: [required('Repite la clave')],
      referralMatricula: [
        required('La matrícula de referido es obligatoria'),
        digitsOnly('La matrícula solo lleva números'),
      ],
    },
  });

  const submit = async () => {
    setError(null);
    if (!form.validate()) return;

    if (form.values.password !== form.values.confirmPassword) {
      form.setError('confirmPassword', 'Las claves no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: form.values.email.trim().toLowerCase(),
        firstName: form.values.firstName.trim(),
        lastName: form.values.lastName.trim(),
        password: form.values.password,
        referralMatricula: form.values.referralMatricula.trim(),
      });
      // El registro devuelve token: la app pasa sola al menú privado.
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        form.setError('email', 'Ese correo ya está registrado');
        setError('Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.');
      } else if (caught instanceof ApiError && caught.status === 422) {
        form.setError('referralMatricula', 'Matrícula no válida');
        setError(
          'La matrícula de referido no es válida. Verifica que sea la de un estudiante del padrón.',
        );
      } else {
        setError(caught);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>
          Necesitas la matrícula de un estudiante que te refiera.
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
        label="Correo"
        required
        placeholder="persona@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!submitting}
        {...form.fieldProps('email')}
      />

      <AppInput
        label="Matrícula de referido"
        required
        placeholder="99999999"
        keyboardType="number-pad"
        hint="Matrícula del estudiante que te refiere."
        editable={!submitting}
        {...form.fieldProps('referralMatricula')}
      />

      <AppInput
        label="Clave"
        required
        isPassword
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        editable={!submitting}
        {...form.fieldProps('password')}
      />

      <AppInput
        label="Repetir clave"
        required
        isPassword
        placeholder="Escribe la clave otra vez"
        editable={!submitting}
        onSubmitEditing={submit}
        returnKeyType="go"
        {...form.fieldProps('confirmPassword')}
      />

      <AppButton title="Crear cuenta" onPress={submit} loading={submitting} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <AppButton
          title="Iniciar sesión"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          disabled={submitting}
        />
      </View>
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
  footer: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
