/**
 * Formulario dinámico completo: recibe una lista de definiciones y las pinta
 * en orden con `<DynamicField />`.
 *
 * Con el hook `useDynamicForm` no tienes que manejar valores ni errores:
 *
 *   const form = useDynamicForm(fields);
 *   …
 *   <DynamicForm fields={fields} {...form.formProps} />
 *   <AppButton title="Enviar" onPress={() => {
 *     if (!form.validate()) return;
 *     enviar(form.toApiValues());
 *   }} />
 */

import { useCallback, useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { DynamicField } from './DynamicField';
import type {
  DynamicFormErrors,
  DynamicFormValues,
  FieldDefinition,
  FieldValue,
} from './types';
import { initialValues, toApiValues, validateFields } from './validation';

export interface DynamicFormProps {
  fields: FieldDefinition[];
  values: DynamicFormValues;
  errors?: DynamicFormErrors;
  onChange: (key: string, value: FieldValue) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function DynamicForm({
  fields,
  values,
  errors = {},
  onChange,
  disabled,
  style,
}: DynamicFormProps) {
  return (
    <View style={style}>
      {fields.map((field) => (
        <DynamicField
          key={field.key}
          field={field}
          value={values[field.key] ?? null}
          error={errors[field.key]}
          disabled={disabled}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </View>
  );
}

export interface UseDynamicFormResult {
  values: DynamicFormValues;
  errors: DynamicFormErrors;
  setValue: (key: string, value: FieldValue) => void;
  /** Reemplaza todos los valores (ej. al cargar una oferta para editar). */
  setValues: (values: DynamicFormValues) => void;
  /** Valida todo; devuelve `true` si no hay errores y guarda los mensajes. */
  validate: () => boolean;
  reset: () => void;
  /** Valores listos para mandar al API. */
  toApiValues: () => Record<string, unknown>;
  /** Props que espera `<DynamicForm />`. */
  formProps: Pick<DynamicFormProps, 'values' | 'errors' | 'onChange'>;
}

/** Maneja valores, errores y validación de un formulario dinámico. */
export function useDynamicForm(
  fields: FieldDefinition[],
  defaults: DynamicFormValues = {},
): UseDynamicFormResult {
  const [values, setValues] = useState<DynamicFormValues>(() =>
    initialValues(fields, defaults),
  );
  const [errors, setErrors] = useState<DynamicFormErrors>({});

  const setValue = useCallback((key: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [key]: value }));
    // Al escribir se limpia el error del campo: se vuelve a validar al enviar.
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }, []);

  const validate = useCallback(() => {
    const found = validateFields(fields, values);
    setErrors(found);
    return Object.keys(found).length === 0;
  }, [fields, values]);

  const reset = useCallback(() => {
    setValues(initialValues(fields, defaults));
    setErrors({});
    // `defaults` se toma tal como venía al montar: no se re-crea el formulario
    // si el objeto literal cambia de identidad en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const formProps = useMemo(
    () => ({ values, errors, onChange: setValue }),
    [values, errors, setValue],
  );

  return {
    values,
    errors,
    setValue,
    setValues,
    validate,
    reset,
    toApiValues: () => toApiValues(fields, values),
    formProps,
  };
}
