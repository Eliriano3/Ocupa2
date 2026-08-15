/**
 * Constructor de las preguntas que responderán los aplicantes
 * (`OfferInput.questions[]`).
 *
 * Agrega, edita, elimina y reordena preguntas de tipo `text`, `date`, `select`
 * y `check`, con la marca de requerida y las opciones de `select`.
 *
 * El spec pide arrastrar para reordenar; en su lugar se usan las flechas
 * arriba/abajo, que es la alternativa accesible que el propio spec exige y no
 * obliga a sumar una dependencia de drag & drop al proyecto.
 *
 *   <QuestionBuilder questions={draft.questions} onChange={(qs) => patch({ questions: qs })} />
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton, AppInput, Card } from '@/components';
import type { OfferQuestionType } from '@/api/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import {
  QUESTIONS_MAX,
  QUESTION_LABEL_MAX,
  QUESTION_LABEL_MIN,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ORDER,
  TOUCH_TARGET,
} from '../constants';
import { emptyQuestion, type DraftQuestion } from '../state/PublishDraftContext';
import { SegmentedControl } from './SegmentedControl';

export interface QuestionBuilderProps {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  /** Pregunta que se está editando; `null` cuando no hay ninguna abierta. */
  const [editing, setEditing] = useState<DraftQuestion | null>(null);
  /** `true` si la pregunta abierta todavía no está en la lista. */
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [optionDraft, setOptionDraft] = useState('');

  const full = questions.length >= QUESTIONS_MAX;

  /* ------------------------------ Acciones ------------------------------ */

  const openNew = () => {
    setEditing(emptyQuestion());
    setIsNew(true);
    setError(undefined);
    setOptionDraft('');
  };

  const openEdit = (question: DraftQuestion) => {
    setEditing({ ...question, options: [...question.options] });
    setIsNew(false);
    setError(undefined);
    setOptionDraft('');
  };

  const close = () => {
    setEditing(null);
    setIsNew(false);
    setError(undefined);
    setOptionDraft('');
  };

  const save = () => {
    if (!editing) return;

    const label = editing.label.trim();
    if (label.length < QUESTION_LABEL_MIN) {
      setError(`La pregunta debe tener al menos ${QUESTION_LABEL_MIN} caracteres.`);
      return;
    }
    if (label.length > QUESTION_LABEL_MAX) {
      setError(`La pregunta no puede pasar de ${QUESTION_LABEL_MAX} caracteres.`);
      return;
    }
    if (editing.type === 'select' && editing.options.length < 2) {
      setError('Una pregunta de opciones necesita al menos dos opciones.');
      return;
    }

    const saved: DraftQuestion = { ...editing, label };
    onChange(
      isNew
        ? [...questions, saved]
        : questions.map((question) => (question.id === saved.id ? saved : question)),
    );
    close();
  };

  const remove = (id: string) => {
    onChange(questions.filter((question) => question.id !== id));
    if (editing?.id === id) close();
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;

    const next = [...questions];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const addOption = () => {
    if (!editing) return;
    const option = optionDraft.trim();
    if (option.length === 0 || editing.options.includes(option)) return;

    setEditing({ ...editing, options: [...editing.options, option] });
    setOptionDraft('');
  };

  const removeOption = (option: string) => {
    if (!editing) return;
    setEditing({ ...editing, options: editing.options.filter((item) => item !== option) });
  };

  /* ------------------------------- Render ------------------------------- */

  return (
    <View>
      {questions.map((question, index) => {
        const open = editing?.id === question.id && !isNew;
        if (open) return <View key={question.id}>{renderEditor()}</View>;

        return (
          <Card key={question.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.kicker}>{QUESTION_TYPE_LABELS[question.type]}</Text>
              {question.required ? <Text style={styles.requiredTag}>Requerida</Text> : null}
            </View>

            <Text style={styles.question}>{question.label}</Text>

            {question.type === 'select' && question.options.length > 0 ? (
              <Text style={styles.options}>{question.options.join(' · ')}</Text>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                onPress={() => openEdit(question)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Editar la pregunta ${question.label}`}
              >
                <Text style={styles.actionPrimary}>Editar</Text>
              </Pressable>

              <Pressable
                onPress={() => remove(question.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar la pregunta ${question.label}`}
              >
                <Text style={styles.action}>Eliminar</Text>
              </Pressable>

              <View style={styles.reorder}>
                <Pressable
                  onPress={() => move(index, -1)}
                  disabled={index === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Mover la pregunta hacia arriba"
                  accessibilityState={{ disabled: index === 0 }}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={index === 0 ? colors.disabled : colors.textMuted}
                  />
                </Pressable>

                <Pressable
                  onPress={() => move(index, 1)}
                  disabled={index === questions.length - 1}
                  accessibilityRole="button"
                  accessibilityLabel="Mover la pregunta hacia abajo"
                  accessibilityState={{ disabled: index === questions.length - 1 }}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="arrow-down"
                    size={18}
                    color={index === questions.length - 1 ? colors.disabled : colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </Card>
        );
      })}

      {editing && isNew ? renderEditor() : null}

      {!editing ? (
        <Pressable
          onPress={openNew}
          disabled={full}
          accessibilityRole="button"
          accessibilityLabel="Agregar pregunta"
          accessibilityState={{ disabled: full }}
          style={({ pressed }) => [
            styles.addButton,
            full && styles.addButtonDisabled,
            pressed && !full && styles.addButtonPressed,
          ]}
        >
          <Ionicons name="add" size={20} color={full ? colors.disabled : colors.primary} />
          <Text style={[styles.addLabel, full && styles.addLabelDisabled]}>Agregar pregunta</Text>
        </Pressable>
      ) : null}

      <Text style={styles.counter}>
        {questions.length} de {QUESTIONS_MAX} usadas
        {questions.length > 1 ? ' · usa las flechas para reordenar' : ''}
      </Text>
    </View>
  );

  /** Tarjeta de edición: es la misma para crear y para modificar. */
  function renderEditor() {
    if (!editing) return null;

    return (
      <View style={styles.editor}>
        <Text style={styles.editorTitle}>{isNew ? 'Nueva pregunta' : 'Editar pregunta'}</Text>

        <AppInput
          label="Pregunta"
          required
          value={editing.label}
          onChangeText={(label) => {
            setEditing({ ...editing, label });
            setError(undefined);
          }}
          placeholder="¿Cuántas mudanzas has hecho este año?"
          maxLength={QUESTION_LABEL_MAX}
          error={error}
          hint={`${editing.label.trim().length}/${QUESTION_LABEL_MAX}`}
          multiline
        />

        <Text style={styles.editorLabel}>Tipo de respuesta</Text>
        <SegmentedControl
          compact
          options={QUESTION_TYPE_ORDER.map((type) => ({
            value: type,
            label: QUESTION_TYPE_LABELS[type],
          }))}
          value={editing.type}
          onChange={(type: OfferQuestionType) =>
            setEditing({ ...editing, type, options: type === 'select' ? editing.options : [] })
          }
        />

        {editing.type === 'select' ? (
          <View style={styles.optionsBlock}>
            <Text style={styles.editorLabel}>Opciones</Text>

            {editing.options.length > 0 ? (
              <View style={styles.chips}>
                {editing.options.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => removeOption(option)}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar la opción ${option}`}
                    style={styles.chip}
                  >
                    <Text style={styles.chipLabel}>{option}</Text>
                    <Ionicons name="close" size={14} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.optionRow}>
              <View style={styles.optionInput}>
                <AppInput
                  value={optionDraft}
                  onChangeText={setOptionDraft}
                  placeholder="Escribe una opción"
                  onSubmitEditing={addOption}
                  returnKeyType="done"
                />
              </View>
              <AppButton
                title="Agregar"
                onPress={addOption}
                variant="secondary"
                fullWidth={false}
                disabled={optionDraft.trim().length === 0}
                style={styles.optionAdd}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.requiredRow}>
          <Text style={styles.requiredLabel}>Respuesta obligatoria</Text>
          <Switch
            value={editing.required}
            onValueChange={(required) => setEditing({ ...editing, required })}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>

        <View style={styles.editorActions}>
          <AppButton
            title="Cancelar"
            onPress={close}
            variant="ghost"
            fullWidth={false}
            style={styles.editorAction}
          />
          <AppButton
            title={isNew ? 'Agregar' : 'Guardar'}
            onPress={save}
            fullWidth={false}
            style={styles.editorAction}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  requiredTag: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  question: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  options: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  action: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionPrimary: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  reorder: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: spacing.xs,
  },
  iconButton: {
    width: TOUCH_TARGET - 12,
    height: TOUCH_TARGET - 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editor: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  editorTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  editorLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionsBlock: {
    marginTop: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  optionInput: {
    flex: 1,
  },
  optionAdd: {
    minWidth: 108,
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  requiredLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editorAction: {
    minWidth: 120,
  },
  addButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  addButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  addLabelDisabled: {
    color: colors.disabled,
  },
  counter: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
