/**
 * Menú principal.
 *
 * Es la pieza que "cambia según haya sesión": sin sesión solo se ven el
 * contenido público y la pestaña para entrar o registrarse; al iniciar sesión
 * aparecen los módulos privados (explorar, publicar y contratos) y la pestaña
 * Cuenta pasa a mostrar los datos del usuario.
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AccountNavigator, AuthNavigator } from '@/features/bloque1-auth';
import { PublishNavigator } from '@/features/bloque2-publicar';
import { ContractsNavigator } from '@/features/bloque3-contratos';
import { ExploreNavigator } from '@/features/bloque4-explorar';
import { ContentNavigator, PublicContentNavigator } from '@/features/bloque5-contenido';
import { colors } from '@/theme';
import type { GuestTabParamList, MainTabParamList } from './types';

const GuestTab = createBottomTabNavigator<GuestTabParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
} as const;

/** Ícono de pestaña por nombre de Ionicons. */
function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

/**
 * Menú sin sesión iniciada: solo el contenido público (Inicio, Noticias,
 * Videos y Acerca de) y la pestaña para entrar o registrarse. Foro, perfil y
 * experiencias ni siquiera se montan, para que nadie llegue a una pantalla que
 * respondería 401.
 */
export function GuestTabs() {
  return (
    <GuestTab.Navigator screenOptions={tabScreenOptions}>
      <GuestTab.Screen
        name="ContentTab"
        component={PublicContentNavigator}
        options={{ title: 'Inicio', tabBarIcon: tabIcon('home-outline') }}
      />
      <GuestTab.Screen
        name="AuthTab"
        component={AuthNavigator}
        options={{ title: 'Entrar', tabBarIcon: tabIcon('log-in-outline') }}
      />
    </GuestTab.Navigator>
  );
}

/** Menú con sesión iniciada: se habilitan todos los módulos privados. */
export function MainTabs() {
  return (
    <MainTab.Navigator screenOptions={tabScreenOptions}>
      <MainTab.Screen
        name="ContentTab"
        component={ContentNavigator}
        options={{ title: 'Inicio', tabBarIcon: tabIcon('home-outline') }}
      />
      <MainTab.Screen
        name="ExploreTab"
        component={ExploreNavigator}
        options={{ title: 'Explorar', tabBarIcon: tabIcon('search-outline') }}
      />
      <MainTab.Screen
        name="PublishTab"
        component={PublishNavigator}
        options={{ title: 'Publicar', tabBarIcon: tabIcon('add-circle-outline') }}
      />
      <MainTab.Screen
        name="ContractsTab"
        component={ContractsNavigator}
        options={{ title: 'Contratos', tabBarIcon: tabIcon('document-text-outline') }}
      />
      <MainTab.Screen
        name="AccountTab"
        component={AccountNavigator}
        options={{ title: 'Cuenta', tabBarIcon: tabIcon('person-outline') }}
      />
    </MainTab.Navigator>
  );
}
