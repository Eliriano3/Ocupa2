/**
 * Paso 4 de 4 · Preguntas — Bloque 2 · Publicar y pagos.
 *
 * Arma el campo `questions` de la oferta: lo que el aplicante responde al
 * postularse. El Bloque 4 las renderiza con el mismo motor de campos dinámicos,
 * así que los tipos tienen que ser los del spec (`text`, `date`, `select`,
 * `check`).
 *
 * Las preguntas son opcionales: se puede publicar sin ninguna.
 */

import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
import { QuestionBuilder, StepFooter, SummaryRow, WizardLayout } from '../components';
import { CONTRACT_TYPE_LABELS, CONTRACT_TYPE_UNITS, PUBLISH_PRICE_USD } from '../constants';
import { usePublishDraft } from '../state/PublishDraftContext';
import { formatDate, formatMoney, parseAmount } from '../utils';
import type { PublishStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<PublishStackParamList, 'OfferQuestions'>;

export default function OfferQuestionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { draft, patch } = usePublishDraft();

  return (
    <Screen padded={false}>
      <WizardLayout
        step={4}
        footer={
          <StepFooter
            label={`Revisar y pagar US$${PUBLISH_PRICE_USD}`}
            onPress={() => navigation.navigate('Payment')}
            hint="Publicar cuesta US$1. El cobro se hace antes de crear la oferta."
          />
        }
      >
        <Text style={styles.intro}>
          Los aplicantes responden estas preguntas al postularse. Te ayudan a comparar sin tener
          que escribirle a cada uno.
        </Text>

        <QuestionBuilder
          questions={draft.questions}
          onChange={(questions) => patch({ questions })}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen de la oferta</Text>

          <SummaryRow label="Tipo de trabajo" value={draft.jobTypeName || '—'} />
          <SummaryRow
            label="Contrato"
            value={CONTRACT_TYPE_LABELS[draft.contractType]}
          />
          <SummaryRow
            label="Pago al trabajador"
            value={`${formatMoney(parseAmount(draft.amount), draft.currency)} · ${CONTRACT_TYPE_UNITS[draft.contractType]}`}
          />
          <SummaryRow label="Dirección" value={draft.address || '—'} />
          <SummaryRow label="Aplicaciones hasta" value={formatDate(draft.deadline)} />
          <SummaryRow
            label="Preguntas"
            value={draft.questions.length === 0 ? 'Ninguna' : `${draft.questions.length}`}
            last
          />
        </View>
      </WizardLayout>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  summary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  summaryTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
});
