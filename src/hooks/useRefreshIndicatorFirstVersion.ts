import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

type Key = readonly unknown[];

/** Compara dos queryKeys por igualdad estricta posición a posición */
function keyEquals(a: readonly unknown[], b: readonly unknown[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function useRefreshIndicator(keys: Key[]) {
  const qc = useQueryClient();

  // Cualquier fetch (primer load o refetch) de alguna key objetivo
  const fetchingCount = useIsFetching({
    predicate: (q) =>
      keys.some((k) => keyEquals(q.queryKey as readonly unknown[], k)) &&
      q.state.fetchStatus === 'fetching',
  });
  const isFetchingAny = fetchingCount > 0;

  // Solo refetch (ya había data antes)
  const refetchingCount = useIsFetching({
    predicate: (q) =>
      keys.some((k) => keyEquals(q.queryKey as readonly unknown[], k)) &&
      q.state.fetchStatus === 'fetching' &&
      q.state.data !== undefined,
  });
  const isRefetchingAny = refetchingCount > 0;

  const refetchAll = useCallback(async () => {
    await Promise.all(
      keys.map((k) =>
        qc.refetchQueries({ queryKey: k as any, type: 'active' })
      )
    );
  }, [qc, keys]);

  return { isFetchingAny, isRefetchingAny, refetchAll };
}
