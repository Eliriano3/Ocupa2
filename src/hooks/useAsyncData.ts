/**
 * Carga datos del API con los tres estados de siempre: cargando, error y datos.
 * Pensado para las pantallas de lista y de detalle de los bloques 2 a 5.
 *
 *   const { data, loading, error, reload, refreshing, refresh } =
 *     useAsyncData(() => offersApi.getOffers({ contractType }), [contractType]);
 *
 *   if (loading) return <Loader />;
 *   if (error) return <ErrorMessage error={error} onRetry={reload} fullScreen />;
 */

import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export interface UseAsyncDataResult<T> {
  data: T | null;
  /** Primera carga (o recarga tras un error). */
  loading: boolean;
  error: unknown;
  /** Vuelve a cargar mostrando el loader. */
  reload: () => Promise<void>;
  /** `true` mientras se recarga con "deslizar para actualizar". */
  refreshing: boolean;
  /** Recarga sin mostrar el loader, para `<RefreshControl />`. */
  refresh: () => Promise<void>;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList = [],
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mounted = useRef(true);
  // Evita que una respuesta vieja pise a una más reciente.
  const requestId = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (mode: 'load' | 'refresh') => {
      const id = ++requestId.current;
      if (mode === 'load') setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const result = await loader();
        if (!mounted.current || id !== requestId.current) return;
        setData(result);
      } catch (caught) {
        if (!mounted.current || id !== requestId.current) return;
        setError(caught);
      } finally {
        if (mounted.current && id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // El loader se recrea en cada render; las dependencias reales las declara
    // quien usa el hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    void run('load');
  }, [run]);

  return {
    data,
    loading,
    error,
    refreshing,
    reload: () => run('load'),
    refresh: () => run('refresh'),
  };
}
