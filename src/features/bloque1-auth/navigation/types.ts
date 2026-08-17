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
  CompleteProfile: undefined;
};

/**
 * Stack que se muestra cuando la cuenta existe pero le falta el perfil
 * (cédula, género y fecha de nacimiento). Solo tiene esa pantalla: hasta que
 * se complete, el API no deja publicar.
 */
export type ProfileSetupStackParamList = {
  CompleteProfile: undefined;
};
