/**
 * Rutas del Bloque 5 · Contenido, foro y perfil.
 * Agrega aquí las pantallas nuevas de tu bloque: este archivo es solo tuyo.
 */

/** Pantallas que no necesitan token: se ven con o sin sesión iniciada. */
export type PublicContentStackParamList = {
  Home: undefined;
  NewsList: undefined;
  NewsDetail: { url: string };
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
