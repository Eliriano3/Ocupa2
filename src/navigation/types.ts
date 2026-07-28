/**
 * Rutas del menú principal.
 *
 * Cada pestaña monta el stack de un bloque; los ParamList de cada bloque
 * viven en `src/features/<bloque>/navigation/types.ts` para que nadie tenga
 * que editar este archivo al agregar una pantalla dentro de su bloque.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

import type { AccountStackParamList, AuthStackParamList } from '@/features/bloque1-auth';
import type { PublishStackParamList } from '@/features/bloque2-publicar';
import type { ContractsStackParamList } from '@/features/bloque3-contratos';
import type { ExploreStackParamList } from '@/features/bloque4-explorar';
import type {
  ContentStackParamList,
  PublicContentStackParamList,
} from '@/features/bloque5-contenido';

/**
 * Pestañas visibles sin sesión iniciada: solo el contenido que no pide token
 * (Inicio, Noticias, Videos, Acerca de) y el acceso a la cuenta.
 */
export type GuestTabParamList = {
  ContentTab: NavigatorScreenParams<PublicContentStackParamList>;
  AuthTab: NavigatorScreenParams<AuthStackParamList>;
};

/** Pestañas visibles con sesión iniciada: todos los módulos privados. */
export type MainTabParamList = {
  ContentTab: NavigatorScreenParams<ContentStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  PublishTab: NavigatorScreenParams<PublishStackParamList>;
  ContractsTab: NavigatorScreenParams<ContractsStackParamList>;
  AccountTab: NavigatorScreenParams<AccountStackParamList>;
};
