/**
 * Navegación del Bloque 5 · Contenido, foro y perfil.
 * Responsable: Katerin Cordero Cubilete · 2024-1575.
 *
 * El stack se monta en dos versiones, porque no todas sus pantallas son
 * públicas:
 *
 *  - `PublicContentNavigator`: Inicio, Noticias, Videos y Acerca de. Funcionan
 *    sin token (`GET /news` y `GET /videos` no llevan `bearerAuth` en el spec),
 *    así que se ven también sin sesión iniciada.
 *  - `ContentNavigator`: lo anterior más Foro, Mi perfil y Experiencias, que sí
 *    piden token. Solo se monta cuando hay sesión.
 *
 * Al agregar una pantalla, ponla en el grupo que le corresponda y decláralas en
 * `types.ts`.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultStackScreenOptions } from '@/navigation/screenOptions';
import HomeScreen from '../screens/HomeScreen';
import NewsListScreen from '../screens/NewsListScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import VideosScreen from '../screens/VideosScreen';
import ForumTopicsScreen from '../screens/ForumTopicsScreen';
import ForumTopicDetailScreen from '../screens/ForumTopicDetailScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ExperiencesScreen from '../screens/ExperiencesScreen';
import AboutScreen from '../screens/AboutScreen';
import type { ContentStackParamList } from './types';

const Stack = createNativeStackNavigator<ContentStackParamList>();

function ContentStack({ includePrivate }: { includePrivate: boolean }) {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Group>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Stack.Screen name="NewsList" component={NewsListScreen} options={{ title: 'Noticias' }} />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{ title: 'Noticia' }}
        />
        <Stack.Screen name="Videos" component={VideosScreen} options={{ title: 'Videos' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Acerca de' }} />
      </Stack.Group>

      {includePrivate ? (
        <Stack.Group>
          <Stack.Screen
            name="ForumTopics"
            component={ForumTopicsScreen}
            options={{ title: 'Foro' }}
          />
          <Stack.Screen
            name="ForumTopicDetail"
            component={ForumTopicDetailScreen}
            options={{ title: 'Tema' }}
          />
          <Stack.Screen
            name="MyProfile"
            component={MyProfileScreen}
            options={{ title: 'Mi perfil' }}
          />
          <Stack.Screen
            name="Experiences"
            component={ExperiencesScreen}
            options={{ title: 'Mis experiencias' }}
          />
        </Stack.Group>
      ) : null}
    </Stack.Navigator>
  );
}

/** Stack completo: contenido público + foro, perfil y experiencias. */
export function ContentNavigator() {
  return <ContentStack includePrivate />;
}

/** Solo el contenido que no necesita token. */
export function PublicContentNavigator() {
  return <ContentStack includePrivate={false} />;
}
