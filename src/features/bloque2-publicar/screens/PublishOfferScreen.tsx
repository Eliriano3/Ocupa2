/**
 * Paso 1 de 4 · Detalles — Bloque 2 · Publicar y pagos.
 * Endpoints: GET /job-types
 *
 * Tipo de trabajo, tipo de contrato, descripción, pago al trabajador y los
 * campos personalizados que trae el tipo elegido (van en `customAnswers`).
 *
 * Nada se manda al API todavía: todo se guarda en el borrador y se envía de
 * una sola vez en `POST /offers`, después de que el pago quede aprobado.
 */

import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { catalogApi, CONTRACT_TYPES, type ContractType } from '@/api';
import {
  AppButton,
  AppInput,
  DynamicForm,
  ErrorMessage,
  Loader,
  Screen,
  fromCustomField,
  initialValues,
  toApiValues,
  validateFields,
  type DynamicFormErrors,
  type DynamicFormValues,
  type FieldValue,
} from '@/components';
import { useAsyncData } from '@/hooks';
import { colors, fontSize, spacing } from '@/theme';
import {
  SegmentedControl,
  SelectSheet,
  StepFooter,
  TextArea,
  WizardLayout,
} from '../components';
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_UNITS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_WARN,
  PAYMENT_MIN,
} from '../constants';
import { usePublishDraft } from '../state/PublishDraftContext';
import { formatThousands, validateAmount, validateDescription } from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'PublishOffer'>;

export default function PublishOfferScreen() {
  const navigation = useNavigation<Navigation>();
  const { draft, patch } = usePublishDraft();

  const loadJobTypes = useCallback(() => catalogApi.getJobTypes(), []);
  const { data: jobTypes, loading, error, reload } = useAsyncData(loadJobTypes, [loadJobTypes]);

  const [errors, setErrors] = useState<{
    jobTypeKey?: string;
    description?: string;
    amount?: string;
  }>({});

  /* --------------------- Campos personalizados del tipo -------------------- */

  const selectedType = jobTypes?.find((type) => type.key === draft.jobTypeKey);

  const customFields = useMemo(
    () => (selectedType?.customFields ?? []).map(fromCustomField),
    [selectedType],
  );

  const [customValues, setCustomValues] = useState<DynamicFormValues>({});
  const [customErrors, setCustomErrors] = useState<DynamicFormErrors>({});

  const setCustomValue = (key: string, value: FieldValue) => {
    setCustomValues((current) => ({ ...current, [key]: value }));
    setCustomErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  /** Al cambiar de tipo de trabajo, los campos anteriores ya no aplican. */
  const chooseJobType = (key: string) => {
    const type = jobTypes?.find((item) => item.key === key);
    const fields = (type?.customFields ?? []).map(fromCustomField);

    patch({ jobTypeKey: key, jobTypeName: type?.name ?? key });
    setCustomValues(initialValues(fields));
    setCustomErrors({});
    setErrors((current) => ({ ...current, jobTypeKey: undefined }));
  };

  /* -------------------------------- Enviar -------------------------------- */

  const goNext = () => {
    const found = {
      jobTypeKey: draft.jobTypeKey ? undefined : 'Elige el tipo de trabajo',
      description: validateDescription(draft.description),
      amount: validateAmount(draft.amount),
    };
    const foundCustom = validateFields(customFields, customValues);

    setErrors(found);
    setCustomErrors(foundCustom);

    const hasError =
      Object.values(found).some(Boolean) || Object.keys(foundCustom).length > 0;
    if (hasError) return;

    patch({ customAnswers: toApiValues(customFields, customValues) });
    navigation.navigate('OfferLocation');
  };

  /* -------------------------------- Estados ------------------------------- */

  if (loading && !jobTypes) {
    return (
      <Screen>
        <Loader message="Cargando los tipos de trabajo…" />
      </Screen>
    );
  }

  if (error && !jobTypes) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={reload} fullScreen />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <WizardLayout step={1} footer={<StepFooter label="Continuar" onPress={goNext} />}>
        <SelectSheet
          label="Tipo de trabajo"
          required
          placeholder="Elige el tipo de trabajo"
          sheetTitle="¿Qué tipo de trabajo es?"
          options={(jobTypes ?? []).map((type) => ({
            value: type.key ?? '',
            label: type.name ?? type.key ?? 'Sin nombre',
            description: type.description,
          }))}
          value={draft.jobTypeKey}
          onChange={chooseJobType}
          error={errors.jobTypeKey}
          hint="Define en qué lista y con qué filtros aparece tu oferta."
        />

        <Text style={styles.label}>
          Tipo de contrato<Text style={styles.required}> *</Text>
        </Text>
        <SegmentedControl
          options={CONTRACT_TYPES.map((type) => ({
            value: type,
            label: CONTRACT_TYPE_LABELS[type],
          }))}
          value={draft.contractType}
          onChange={(contractType: ContractType) => patch({ contractType })}
        />
        <View style={styles.spacer} />

        <TextArea
          label="Descripción"
          required
          value={draft.description}
          onChangeText={(description) => {
            patch({ description });
            setErrors((current) => ({ ...current, description: undefined }));
          }}
          placeholder="Describe la tarea, las herramientas necesarias y cuántas personas hacen falta…"
          maxLength={DESCRIPTION_MAX}
          warnAt={DESCRIPTION_WARN}
          error={errors.description}
          hint={`Mínimo ${DESCRIPTION_MIN} caracteres.`}
        />

        <AppInput
          label="Pago al trabajador"
          required
          value={draft.amount}
          onChangeText={(amount) => {
            patch({ amount });
            setErrors((current) => ({ ...current, amount: undefined }));
          }}
          placeholder="1500"
          keyboardType="numeric"
          error={errors.amount}
          hint={`En pesos dominicanos (RD$), ${CONTRACT_TYPE_UNITS[draft.contractType]}. Mínimo RD$${formatThousands(PAYMENT_MIN)}.`}
        />

        {customFields.length > 0 ? (
          <View style={styles.customBlock}>
            <Text style={styles.sectionTitle}>Datos de {draft.jobTypeName}</Text>
            <Text style={styles.sectionHelp}>
              Los pide este tipo de trabajo. Se guardan junto a la oferta.
            </Text>

            <DynamicForm
              fields={customFields}
              values={customValues}
              errors={customErrors}
              onChange={setCustomValue}
            />
          </View>
        ) : null}

        <AppButton
          title="Ver mis ofertas publicadas"
          onPress={() => navigation.navigate('MyOffers')}
          variant="ghost"
          style={styles.link}
        />
      </WizardLayout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  spacer: {
    height: spacing.md,
  },
  customBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHelp: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  link: {
    marginTop: spacing.sm,
  },
});
