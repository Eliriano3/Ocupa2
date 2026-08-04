/*
 * ----- DETALLE DE NOTICIA -----
 * Pantalla que muestra la información completa de la noticia seleccionada.
 * Permite visualizar la imagen, datos principales y acceder al artículo original.
 */


import { useRoute, type RouteProp } from '@react-navigation/native';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
 
import { AppButton, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
 
import type { PublicContentStackParamList } from '../navigation/types';
 
type Route = RouteProp<PublicContentStackParamList, 'NewsDetail'>;
 
export default function NewsDetailScreen() {
  const { params } = useRoute<Route>();
  const { item } = params;
 
  const openOriginal = () => {
    if (item.url) Linking.openURL(item.url);
  };
 
  return (
    <Screen scroll>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : null}
 
      <Text style={styles.title}>{item.title ?? 'Sin título'}</Text>
 
      <View style={styles.metaRow}>
        {item.source ? <Text style={styles.meta}>{item.source}</Text> : null}
        {item.date ? <Text style={styles.meta}>{formatDate(item.date)}</Text> : null}
      </View>
 
      {item.summary ? <Text style={styles.summary}>{item.summary}</Text> : null}
 
      {item.url ? (
        <AppButton title="Leer artículo completo" onPress={openOriginal} style={styles.button} />
      ) : null}
    </Screen>
  );
}
 
function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  summary: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.xl,
  },
});
 