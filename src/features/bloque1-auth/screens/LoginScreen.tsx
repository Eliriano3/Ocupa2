/**
 * Login · `POST /auth/login` (Bloque 1).
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError } from '@/api';
import { AppButton, AppInput, ErrorMessage, Screen } from '@/components';
import { useForm } from '@/hooks';
import { useAuth } from '@/store';
import { colors, fontSize, spacing } from '@/theme';
import { email as emailRule, password as passwordRule, required } from '@/utils/validation';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const form = useForm({
    initialValues: { email: '', password: '' },
    rules: {
      email: [required('El correo es obligatorio'), emailRule()],
      password: [passwordRule()],
    },
  });

  const submit = async () => {
    setError(null);
    if (!form.validate()) return;

    setSubmitting(true);
    try {
      await login({
        email: form.values.email.trim().toLowerCase(),
        password: form.values.password,
      });
      // Al quedar autenticado, el navegador raíz cambia solo al menú privado.
    } catch (caught) {
      // 401 aquí no es "sesión vencida": son credenciales incorrectas.
      setError(
        caught instanceof ApiError && caught.status === 401
          ? 'Correo o clave incorrectos. Revísalos e intenta de nuevo.'
          : caught,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Es la única pantalla sin cabecera: incluye el borde superior para no
    // quedar debajo de la barra de estado.
    <Screen scroll edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ocupa2</Text>
        <Text style={styles.subtitle}>Entra para publicar o aplicar a ofertas de empleo.</Text>
      </View>

      <ErrorMessage error={error} />

      <AppInput
        label="Correo"
        required
        placeholder="persona@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!submitting}
        {...form.fieldProps('email')}
      />

      <AppInput
        label="Clave"
        required
        isPassword
        placeholder="Mínimo 6 caracteres"
        autoComplete="current-password"
        textContentType="password"
        editable={!submitting}
        onSubmitEditing={submit}
        returnKeyType="go"
        {...form.fieldProps('password')}
      />

      <AppButton title="Entrar" onPress={submit} loading={submitting} />

      <AppButton
        title="Olvidé mi clave"
        variant="ghost"
        onPress={() => navigation.navigate('ForgotPassword')}
        disabled={submitting}
        style={styles.spaced}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <AppButton
          title="Crear cuenta"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
          disabled={submitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl + 6,
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  spaced: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
