/*
 * ----- INICIO -----
 * Pantalla main de la app.
 * Muestra un slider informativo y accesos a las diferentes secciones disponibles.
 */
import { useAuth } from '@/store';
import MenuCard from '../componente5/MenuCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { AppButton, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';

import type { ContentStackParamList } from '../navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_HEIGHT = SCREEN_HEIGHT * 0.42;
const AUTO_PLAY_MS = 4000;

interface Slide {
  id: string;
  image: string;
  title: string;
  message: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
    title: 'Bienvenido a Ocupa2',
    message: 'Conectamos personas que necesitan un trabajo puntual con quienes pueden hacerlo.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    title: 'Publica lo que necesitas',
    message: 'Cuenta lo que buscas y recibe aplicantes interesados.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    title: 'O aplica a una oferta',
    message: 'Explora oportunidades cerca de ti y postúlate en minutos.',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    title: 'Elige con confianza',
    message: 'Revisa perfiles, califica y decide quién es el indicado.',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800',
    title: 'Todo desde tu celular',
    message: 'Publica, aplica y da seguimiento sin complicaciones.',
  },
];

type Navigation = NativeStackNavigationProp<ContentStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { isAuthenticated } = useAuth();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    autoPlayTimer.current = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % SLIDES.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_PLAY_MS);
  }, []);

  // Arranca el auto-avance al montar la pantalla y lo limpia al salir.
  useEffect(() => {
    startAutoPlay();

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [startAutoPlay]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(index);
      // Si el usuario desliza a mano, reinicia el temporizador para que no
      // "pelee" con el auto-avance justo después.
      startAutoPlay();
    },
    [startAutoPlay],
  );

  return (
    <Screen padded={false} scroll contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.sliderWrap}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={{ uri: item.image }} style={styles.slideImage} resizeMode="cover" />
              <View style={styles.slideOverlay}>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideMessage}>{item.message}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Encuentra trabajo o publica una oportunidad</Text>
        <Text style={styles.subheading}>
          Diferentes tipos de trabajo, disponibles cerca de ti. Publica lo que necesitas o
          explora las oportunidades que otros usuarios han dejado disponibles.
        </Text>

        <View style={styles.exploreButton}>
          <AppButton
            title="Explorar ofertas"
            onPress={() => {
              if (isAuthenticated) {
                navigation.getParent()?.navigate('ExploreTab' as never);
              } else {
                navigation.getParent()?.navigate('AuthTab' as never);
              }
            }}
          />

        </View>
        <View style={styles.actions}>

          <MenuCard
            icon="newspaper-outline"
            title="Noticias"
            onPress={() => navigation.navigate('NewsList')}
          />
          <MenuCard
            icon="videocam-outline"
            title="Videos"
            onPress={() => navigation.navigate('Videos')}
          />



          {isAuthenticated && (
            <>
              <MenuCard
                icon="people-outline"
                title="Foro"
                onPress={() => navigation.navigate('ForumTopics')}
              />


              <MenuCard
                icon="person-outline"
                title="Mi Perfil"
                onPress={() => navigation.navigate('MyProfile')}
              />


            </>
          )}

          <View style={styles.aboutCard}>
            <MenuCard
              icon="information-circle-outline"
              title="Acerca de"
              onPress={() => navigation.navigate('About')}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sliderWrap: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(11, 60, 122, 0.55)',
  },
  slideTitle: {
    color: colors.textInverse,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  slideMessage: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.textInverse,
    width: 20,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    /*gap: spacing.md,*/
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,

  },
  subheading: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.md,

  },
  actions: {
    width: '100%',
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  exploreButton: {
    width: '100%',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  aboutCard: {
    width: '100%',
    alignItems: 'center',
  },
});