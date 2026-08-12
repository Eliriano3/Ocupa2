import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Screen, Card, Loader, EmptyState, ErrorMessage, AppButton } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import { useAsyncData } from '@/hooks';
import { applicationsApi } from '@/api';

export default function MyApplicationsScreen() {
  const navigation = useNavigation<any>();

  const fetchApplications = useCallback(() => {
    return applicationsApi.getMyApplications();
  }, []);

  const { data: applications, loading, error, refresh } = useAsyncData(fetchApplications, [fetchApplications]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied': return 'En revisión';
      case 'discarded': return 'Descartado';
      case 'finalist': return 'Finalista';
      case 'winner': return '¡Ganador!';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return '#f39c12';
      case 'discarded': return '#e74c3c';
      case 'finalist': return '#3498db';
      case 'winner': return '#2ecc71';
      default: return '#666';
    }
  };

  if (error) {
    return (
      <Screen>
        <ErrorMessage error={error} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll={false}>
      {loading && !applications ? (
        <Loader message="Cargando tus aplicaciones..." />
      ) : applications?.length === 0 ? (
        <EmptyState
          title="Aún no has aplicado a ninguna oferta"
          message="Explora las ofertas disponibles y encuentra tu próximo trabajo."
          actionLabel="Explorar Ofertas"
          onAction={() => navigation.navigate('ExploreOffers')}
        />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContainer}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <View style={styles.cardContainer}>
                <Card
                  onPress={() => toggleExpand(item.id!)}
                  style={styles.card}
                >
                  {item.offer?.photo ? (
                    <Image source={{ uri: item.offer.photo }} style={styles.cardImage} />
                  ) : null}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.offer?.jobTypeName || item.offer?.jobTypeKey}</Text>
                    <Text style={styles.cardSubtitle}>
                      {item.offer?.contractType} • {item.offer?.payment?.amount} {item.offer?.payment?.currency}
                    </Text>
                    <View style={styles.expandHintContainer}>
                      <Text style={styles.expandHint}>
                        {isExpanded ? "Ocultar detalles" : "Ver detalles de la aplicación"}
                      </Text>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#0055cc" />
                    </View>
                  </View>
                </Card>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status!) }]}>
                  <Text style={styles.statusText}>{getStatusText(item.status!)}</Text>
                </View>

                {isExpanded && (
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="calendar-outline" size={18} color="#666" />
                      <Text style={styles.detailLabelHeader}>Fecha de postulación</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha desconocida'}
                    </Text>

                    {item.comment ? (
                      <View style={styles.sectionMargin}>
                        <View style={styles.detailHeader}>
                          <Ionicons name="document-text-outline" size={18} color="#666" />
                          <Text style={styles.detailLabelHeader}>Mi Justificación</Text>
                        </View>
                        <Text style={styles.detailValueComment}>"{item.comment}"</Text>
                      </View>
                    ) : null}

                    {item.answers && item.answers.length > 0 && (
                      <View style={styles.answersSection}>
                        <View style={styles.detailHeader}>
                          <Ionicons name="list-outline" size={18} color="#666" />
                          <Text style={styles.detailLabelHeader}>Cuestionario Respondido</Text>
                        </View>
                        {item.answers.map((ans, idx) => {
                          const foundQuestion = item.offer?.questions?.find(q => q.id === ans.questionId);
                          const displayLabel = ans.label || foundQuestion?.label || 'Pregunta sin título';
                          
                          return (
                            <View key={idx} style={styles.answerBlock}>
                              <Text style={styles.questionLabel}>{displayLabel}</Text>
                              <View style={styles.answerValueContainer}>
                                <Text style={styles.answerValue}>{String(ans.value)}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
                
                {/* Si es ganador, mostrar botón para ir al contrato (Bloque 3) */}
                {item.status === 'winner' && item.contractId && (
                  <View style={styles.winnerSection}>
                    <Ionicons name="trophy" size={24} color="#f1c40f" />
                    <Text style={styles.winnerText}>¡Fuiste seleccionado!</Text>
                    {item.offer?.publisher && (
                      <Text style={styles.publisherInfo}>
                        Empleador: <Text style={{fontWeight: 'bold'}}>{item.offer.publisher.nombre}</Text>
                      </Text>
                    )}
                    <AppButton
                      title="Ver Contrato"
                      onPress={() => navigation.navigate('ContractsTab', {
                        screen: 'ContractDetail',
                        params: { id: item.contractId }
                      })}
                      style={styles.contractButton}
                    />
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  card: {
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#ccc',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  expandHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expandHint: {
    fontSize: 13,
    color: '#0055cc',
    fontWeight: '600',
    marginRight: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    backgroundColor: '#f4f6f8',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabelHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#444',
    marginLeft: 24,
  },
  detailValueComment: {
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic',
    marginLeft: 24,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionMargin: {
    marginTop: 16,
  },
  answersSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#dcdcdc',
  },
  answerBlock: {
    marginTop: 12,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  answerValueContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  answerValue: {
    fontSize: 15,
    color: '#555',
  },
  winnerSection: {
    backgroundColor: '#fffcf0',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1c40f',
    borderStyle: 'dashed',
  },
  winnerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d35400',
    marginTop: 8,
    textAlign: 'center',
  },
  publisherInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 16,
  },
  contractButton: {
    width: '100%',
  },
});
