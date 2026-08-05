/**
 * Cambiar clave · `PUT /me/password` (Bloque 1).
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton, AppInput, ConfirmDialog, ErrorMessage, Screen } from '@/components';
import { useForm } from '@/hooks';
import { useAuth } from '@/store';
import { colors, fontSize, spacing } from '@/theme';
import { password as passwordRule, required } from '@/utils/validation';
import type { AccountStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AccountStackParamList, 'ChangePassword'>;

export default function ChangePasswordScreen({ navigation }: Props) {
  const { changePassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm({
    initialValues: { password: '', confirmPassword: '' },
    rules: {
      password: [passwordRule()],
      confirmPassword: [required('Repite la clave nueva')],
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
      await changePassword(form.values.password);
      setSaved(true);
    } catch (caught) {
      setError(caught);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Cambiar clave</Text>
        <Text style={styles.subtitle}>
          La clave nueva debe tener al menos 6 caracteres.
        </Text>
      </View>

      <ErrorMessage error={error} />

      <AppInput
        label="Clave nueva"
        required
        isPassword
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        editable={!submitting}
        {...form.fieldProps('password')}
      />

      <AppInput
        label="Repetir clave nueva"
        required
        isPassword
        placeholder="Escribe la clave otra vez"
        editable={!submitting}
        onSubmitEditing={submit}
        returnKeyType="go"
        {...form.fieldProps('confirmPassword')}
      />

      <AppButton title="Guardar clave" onPress={submit} loading={submitting} />

      <ConfirmDialog
        visible={saved}
        title="Clave actualizada"
        message="Tu clave se cambió correctamente."
        confirmLabel="Entendido"
        onConfirm={() => {
          setSaved(false);
          navigation.goBack();
        }}
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
});
