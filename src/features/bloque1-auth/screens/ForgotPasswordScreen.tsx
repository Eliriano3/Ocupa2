/**
 * Olvidé mi clave · `POST /auth/forgot-password` (Bloque 1).
 *
 * Si el correo y la matrícula coinciden, el API manda una clave temporal por
 * correo. El endpoint responde 200 aunque la cuenta no exista, así que el
 * mensaje de éxito no confirma ni niega que el correo esté registrado.
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { authApi } from '@/api';
import { AppButton, AppInput, Card, ErrorMessage, Screen } from '@/components';
import { useForm } from '@/hooks';
import { colors, fontSize, spacing } from '@/theme';
import { digitsOnly, email as emailRule, required } from '@/utils/validation';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [sent, setSent] = useState(false);

  const form = useForm({
    initialValues: { email: '', referralMatricula: '' },
    rules: {
      email: [required('El correo es obligatorio'), emailRule()],
      referralMatricula: [
        required('La matrícula de referido es obligatoria'),
        digitsOnly('La matrícula solo lleva números'),
      ],
    },
  });

  const submit = async () => {
    setError(null);
    if (!form.validate()) return;

    setSubmitting(true);
    try {
      await authApi.forgotPassword({
        email: form.values.email.trim().toLowerCase(),
        referralMatricula: form.values.referralMatricula.trim(),
      });
      setSent(true);
    } catch (caught) {
      setError(caught);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Screen scroll>
        <Card style={styles.successCard}>
          <Ionicons name="mail-outline" size={40} color={colors.success} />
          <Text style={styles.successTitle}>Revisa tu correo</Text>
          <Text style={styles.successText}>
            Si el correo y la matrícula coinciden con una cuenta, te enviamos una clave
            temporal. Úsala para entrar y luego cámbiala desde tu cuenta.
          </Text>
        </Card>

        <AppButton title="Volver al inicio de sesión" onPress={() => navigation.navigate('Login')} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Olvidé mi clave</Text>
        <Text style={styles.subtitle}>
          Escribe el correo de tu cuenta y la matrícula con la que te registraste.
        </Text>
      </View>

      <ErrorMessage error={error} />

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
        editable={!submitting}
        onSubmitEditing={submit}
        returnKeyType="go"
        {...form.fieldProps('referralMatricula')}
      />

      <AppButton title="Enviar clave temporal" onPress={submit} loading={submitting} />

      <AppButton
        title="Volver"
        variant="ghost"
        onPress={() => navigation.goBack()}
        disabled={submitting}
        style={styles.spaced}
      />
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
  spaced: {
    marginTop: spacing.sm,
  },
  successCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  successTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
