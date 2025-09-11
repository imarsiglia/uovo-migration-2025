import {useIsFetching, useQueryClient} from '@tanstack/react-query';
import {useCallback, useMemo} from 'react';

type Key = readonly unknown[];

/** Comparación profunda (arrays/objetos/primitivos) */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    // Arrays
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++)
        if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    // Objetos planos
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) if (!deepEqual(a[k], (b as any)[k])) return false;
    return true;
  }
  return false;
}

export function useRefreshIndicator(keys: Key[]) {
  const qc = useQueryClient();

  // Memo para no recrear predicados en cada render
  const matchesAnyKey = useMemo(
    () => (qk: readonly unknown[]) => keys.some((k) => deepEqual(qk, k)),
    [keys],
  );

  // Cualquier fetch (primer load o refetch)
  const fetchingCount = useIsFetching({
    predicate: (q) => matchesAnyKey(q.queryKey as readonly unknown[]),
  });
  const isFetchingAny = fetchingCount > 0;

  // Solo refetch (ya había data antes)
  const refetchingCount = useIsFetching({
    predicate: (q) =>
      matchesAnyKey(q.queryKey as readonly unknown[]) &&
      // está haciendo fetch
      q.state.fetchStatus === 'fetching' &&
      // ya había data antes (v5: dataUpdatedAt > 0)
      ((q.state as any).dataUpdatedAt > 0 || q.state.data !== undefined),
  });
  const isRefetchingAny = refetchingCount > 0;

  const refetchAll = useCallback(async () => {
    await Promise.all(
      keys.map((k) =>
        qc.refetchQueries({
          queryKey: k as any,
          type: 'active', // solo montadas
          exact: true, // coincidencia exacta con la key
        }),
      ),
    );
  }, [qc, keys]);

  const removeAndRefresh = useCallback(async () => {
    await Promise.all(
      keys.map(async (k) => {
        // 1. Cancelar cualquier query activa
        await qc.cancelQueries({queryKey: k});
        // 2. Remover del cache
        qc.removeQueries({queryKey: k});
        // 3. Prefetch (volver a consultar los datos)
        await qc.invalidateQueries({queryKey: k});
        await qc.prefetchQuery({queryKey: k});
      }),
    );
  }, [qc, keys]);

  const hardRefresh = useCallback(async (key: string, activeProps: any) => {
    // 1) Cortar requests previos (evita que pisen la data nueva)
    await qc.cancelQueries({queryKey: [key]});

    // 2) (Opcional) limpiar caches inactivos
    qc.removeQueries({queryKey: [key], type: 'inactive'});

    // 4) Forzar que el activo se actualice con datos frescos
    await qc.invalidateQueries({queryKey: [key, activeProps], exact: true});
    await qc.refetchQueries({
      queryKey: [key, activeProps],
      exact: true,
      type: 'active',
    });
  }, []);

  const hardRefreshMany = useCallback(async () => {
    if (!keys.length) return;

    // 1) Cancelar TODOS los fetch en curso por prefijo (en paralelo)
    await Promise.all(keys.map(([key]) => qc.cancelQueries({queryKey: [key]})));

    // 2) Remover caches INACTIVOS por prefijo (sin tocar los montados)
    keys.forEach(([key]) => {
      qc.removeQueries({queryKey: [key], type: 'inactive'});
    });

    // 3) Invalidate de las variantes activas (exact)
    // await Promise.all(
    //   keys.map(([key, activeProps]) =>
    //     qc.invalidateQueries({queryKey: [key, activeProps], exact: true}),
    //   ),
    // );

    // 4) Refetch de las variantes activas montadas
    await Promise.all(
      keys.map(([key, activeProps]) =>
        qc.refetchQueries({
          queryKey: [key, activeProps],
          exact: true,
          type: 'active',
        }),
      ),
    );
  }, [qc, keys]);

  return {
    isFetchingAny,
    isRefetchingAny,
    refetchAll,
    removeAndRefresh,
    hardRefresh,
    hardRefreshMany
  };
}
