/**
 * Estado de sesión global (Bloque 1).
 *
 * Guarda el token en almacenamiento seguro, lo restaura al abrir la app y se
 * lo entrega al cliente HTTP para que lo mande en cada petición. Cuando el API
 * responde 401 en una petición autenticada, la sesión se cierra sola.
 *
 * En cualquier pantalla:
 *
 *   const { user, isAuthenticated, logout } = useAuth();
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { authApi, configureApiClient, profileApi, type User } from '@/api';
import type { LoginRequest, RegisterRequest } from '@/api/auth';
import { clearSession, loadToken, loadUser, saveToken, saveUser } from '@/services/secureStorage';

/**
 * El token vive fuera de React para que el cliente HTTP pueda leerlo sin
 * depender del árbol de componentes (y sin closures desactualizados).
 */
let currentToken: string | null = null;
let notifyUnauthorized: () => void = () => {};

configureApiClient({
  getToken: () => currentToken,
  onUnauthorized: () => notifyUnauthorized(),
});

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface AuthContextValue {
  /** `loading` mientras se restaura la sesión guardada. */
  status: AuthStatus;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Crea la cuenta y deja la sesión iniciada. */
  register: (input: RegisterRequest) => Promise<User>;
  login: (input: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  /** Vuelve a pedir `GET /me` y actualiza el usuario en memoria. */
  refreshProfile: () => Promise<User | null>;
  /** `PUT /me/password`. */
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const applySession = useCallback(async (newToken: string, newUser: User) => {
    currentToken = newToken;
    await Promise.all([saveToken(newToken), saveUser(newUser)]);
    if (!mounted.current) return;
    setTokenState(newToken);
    setUser(newUser);
    setStatus('authenticated');
  }, []);

  const clearLocalSession = useCallback(async () => {
    currentToken = null;
    await clearSession();
    if (!mounted.current) return;
    setTokenState(null);
    setUser(null);
    setStatus('guest');
  }, []);

  // El cliente HTTP avisa aquí cuando un 401 invalida la sesión.
  useEffect(() => {
    notifyUnauthorized = () => {
      void clearLocalSession();
    };
    return () => {
      notifyUnauthorized = () => {};
    };
  }, [clearLocalSession]);

  // Restaura la sesión guardada al abrir la app.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [savedToken, savedUser] = await Promise.all([loadToken(), loadUser<User>()]);
      if (cancelled) return;

      if (!savedToken) {
        setStatus('guest');
        return;
      }

      currentToken = savedToken;
      setTokenState(savedToken);
      setUser(savedUser);
      setStatus('authenticated');

      // Confirmamos contra el API que el token sigue vivo. Si devuelve 401,
      // el cliente dispara `onUnauthorized` y la sesión se limpia sola.
      try {
        const fresh = await profileApi.getMe();
        if (cancelled) return;
        setUser(fresh);
        await saveUser(fresh);
      } catch {
        // Sin conexión: seguimos con los datos guardados.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(
    async (input: RegisterRequest) => {
      const session = await authApi.register(input);
      await applySession(session.token, session.user ?? {});
      return session.user ?? {};
    },
    [applySession],
  );

  const login = useCallback(
    async (input: LoginRequest) => {
      const session = await authApi.login(input);
      await applySession(session.token, session.user ?? {});
      return session.user ?? {};
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await clearLocalSession();
  }, [clearLocalSession]);

  const refreshProfile = useCallback(async () => {
    const fresh = await profileApi.getMe();
    if (!mounted.current) return fresh;
    setUser(fresh);
    await saveUser(fresh);
    return fresh;
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    await profileApi.changePassword({ password: newPassword });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      isAuthenticated: status === 'authenticated',
      register,
      login,
      logout,
      refreshProfile,
      changePassword,
    }),
    [status, user, token, register, login, logout, refreshProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}
