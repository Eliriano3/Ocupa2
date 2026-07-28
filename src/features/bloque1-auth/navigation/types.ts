/**
 * Rutas del Bloque 1.
 * Cada bloque declara aquí su propio ParamList para que nadie tenga que
 * editar un archivo compartido al agregar una pantalla.
 */

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AccountStackParamList = {
  Account: undefined;
  ChangePassword: undefined;
};
