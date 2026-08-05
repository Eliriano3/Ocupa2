/**
 * Rutas del Bloque 5 · Contenido, foro y perfil.
 * Agrega aquí las pantallas nuevas de tu bloque: este archivo es solo tuyo.
 */
 
import type { NewsItem } from '@/api/types';
 
/** Pantallas que no necesitan token: se ven con o sin sesión iniciada. */
export type PublicContentStackParamList = {
  Home: undefined;
  NewsList: undefined;
  /**
   * El API no tiene endpoint de detalle de noticia, así que se envía la
   * noticia completa desde el listado en vez de solo la `url`.
   */
  NewsDetail: { item: NewsItem };
  Videos: undefined;
  About: undefined;
};
 
/**
 * Pantallas que sí piden token (`GET /forum/topics`, `GET /me`,
 * `GET /me/experiences`): solo se montan cuando hay sesión.
 */
export type PrivateContentStackParamList = {
  ForumTopics: undefined;
  ForumTopicDetail: { topicId: string };
  MyProfile: undefined;
  Experiences: undefined;
};
 
/** Stack completo, el que ve un usuario con sesión iniciada. */
export type ContentStackParamList = PublicContentStackParamList &
  PrivateContentStackParamList;
 