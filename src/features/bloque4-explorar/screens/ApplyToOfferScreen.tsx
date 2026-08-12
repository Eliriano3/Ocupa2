import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Screen, Loader, ErrorMessage, AppButton, AppInput, ConfirmDialog } from '@/components';
import { DynamicForm, useDynamicForm, fromOfferQuestion } from '@/components/dynamic-fields';
import { useAsyncData } from '@/hooks';
import { offersApi, applicationsApi } from '@/api';
import type { ExploreStackParamList } from '../navigation/types';

type ApplyRouteProp = RouteProp<ExploreStackParamList, 'ApplyToOffer'>;
type NavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'ApplyToOffer'>;

export default function ApplyToOfferScreen() {
  const route = useRoute<ApplyRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { offerId } = route.params;

  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // fetch the offer to get the questions
  const fetchOffer = useCallback(() => {
    return offersApi.getOffer(offerId);
  }, [offerId]);

  const { data: offer, loading, error, refresh } = useAsyncData(fetchOffer, [fetchOffer]);

  // map offer questions to dynamic fields
  const fields = React.useMemo(() => {
    if (!offer?.questions) return [];
    return offer.questions.map(fromOfferQuestion);
  }, [offer]);

  const dynamicForm = useDynamicForm(fields);

  const handleApply = async () => {
    if (!comment.trim()) {
      setErrorMsg('Debes escribir un comentario explicando por qué eres apto.');
      setShowConfirm(true);
      return;
    }

    if (!dynamicForm.validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const answers = Object.entries(dynamicForm.values).map(([questionId, value]) => {
        const question = offer?.questions?.find(q => q.id === questionId);
        return {
          questionId,
          label: question?.label || 'Pregunta',
          value,
        };
      });

      await applicationsApi.applyToOffer(offerId, {
        comment,
        answers,
      });

      setErrorMsg('');
      setShowConfirm(true);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al aplicar a la oferta. Intenta de nuevo.');
      if (e.response?.status === 409) {
        setErrorMsg('Ya aplicaste a esta oferta anteriormente.');
      }
      setShowConfirm(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowConfirm(false);
    if (!errorMsg) {
      // If no error, it was a success. Go back.
      navigation.goBack();
    }
  };

  if (error) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={refresh} />
      </Screen>
    );
  }

  if (loading && !offer) {
    return (
      <Screen>
        <Loader message="Cargando formulario..." />
      </Screen>
    );
  }

  if (!offer) {
    return (
      <Screen>
        <Text style={styles.errorText}>Oferta no encontrada.</Text>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Aplicar a: {offer.jobTypeName || offer.jobTypeKey}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>¿Por qué te consideras apto? *</Text>
          <AppInput
            placeholder="Escribe tu comentario aquí..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
        </View>

        {fields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Preguntas adicionales</Text>
            <DynamicForm fields={fields} {...dynamicForm.formProps} />
          </View>
        )}

        <AppButton
          title="Enviar Aplicación"
          onPress={handleApply}
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title={errorMsg ? "Atención" : "¡Éxito!"}
        message={errorMsg || "Tu aplicación ha sido enviada correctamente."}
        confirmLabel="Aceptar"
        onConfirm={handleDialogClose}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
});
