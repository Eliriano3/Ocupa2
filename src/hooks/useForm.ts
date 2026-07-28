/**
 * Hook de formularios de texto: valores, errores y validación.
 *
 *   const form = useForm({
 *     initialValues: { email: '', password: '' },
 *     rules: {
 *       email: [required('El correo es obligatorio'), email()],
 *       password: [password()],
 *     },
 *   });
 *
 *   <AppInput {...form.fieldProps('email')} label="Correo" />
 *   <AppButton title="Entrar" onPress={() => { if (form.validate()) enviar(form.values); }} />
 */

import { useCallback, useMemo, useState } from 'react';

import { firstError, type Validator } from '@/utils/validation';

export type FormValues = Record<string, string>;
export type FormErrors<T extends FormValues> = Partial<Record<keyof T, string>>;
export type FormRules<T extends FormValues> = Partial<Record<keyof T, Validator[]>>;

export interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  rules?: FormRules<T>;
}

export interface FieldProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export interface UseFormResult<T extends FormValues> {
  values: T;
  errors: FormErrors<T>;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Fija un error a mano, ej. al traducir un 409 del API a un campo. */
  setError: (key: keyof T, message: string | undefined) => void;
  /** Valida todo; devuelve `true` si no hay errores. */
  validate: () => boolean;
  reset: () => void;
  /** Props listas para `<AppInput />`. */
  fieldProps: (key: keyof T) => FieldProps;
}

export function useForm<T extends FormValues>({
  initialValues,
  rules = {},
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    // Se limpia el error al escribir; se vuelve a validar al enviar.
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }, []);

  const setError = useCallback((key: keyof T, message: string | undefined) => {
    setErrors((current) => ({ ...current, [key]: message }));
  }, []);

  const validate = useCallback(() => {
    const found: FormErrors<T> = {};
    let valid = true;

    for (const key of Object.keys(values) as (keyof T)[]) {
      const validators = rules[key];
      if (!validators) continue;
      const error = firstError(values[key], validators);
      if (error) {
        found[key] = error;
        valid = false;
      }
    }

    setErrors(found);
    return valid;
  }, [values, rules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const fieldProps = useCallback(
    (key: keyof T): FieldProps => ({
      value: values[key],
      onChangeText: (text: string) => setValue(key, text as T[keyof T]),
      error: errors[key],
    }),
    [values, errors, setValue],
  );

  return useMemo(
    () => ({ values, errors, setValue, setError, validate, reset, fieldProps }),
    [values, errors, setValue, setError, validate, reset, fieldProps],
  );
}
