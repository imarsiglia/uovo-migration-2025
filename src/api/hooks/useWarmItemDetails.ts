import {useEffect, useMemo, useRef, useState} from 'react';
import {QueryClient, QueryKey, useQueryClient} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import {promisePool} from '@utils/functions';

type WarmOpts<TItem> = {
  list: TItem[] | undefined;
  getId: (item: TItem) => number | string;
  makeKey: (id: number | string) => QueryKey;
  fetcher: (id: number | string, ctx?: {signal?: AbortSignal}) => Promise<any>;
  concurrency?: number;
  /** si hay data, refresca solo si está “vieja” (ms) */
  ttlMs?: number;
  /** permite encadenar fases: corre sólo si true */
  enabled?: boolean;
};

type WarmState = {
  running: boolean;
  done: boolean;
  queued: number;
};

export function useWarmItemDetails<TItem>({
  list,
  getId,
  makeKey,
  fetcher,
  concurrency = 4,
  ttlMs = 0,
  enabled = true,
}: WarmOpts<TItem>): WarmState {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [queued, setQueued] = useState(0);
  const runId = useRef(0);

  const idsToFetch = useMemo(() => {
    if (!list?.length || !enabled) return [];
    const ids = Array.from(new Set(list.map(getId).filter((x) => x != null)));
    return ids.filter((id) => {
      const state = qc.getQueryState(makeKey(id));
      if (!state?.data) return true;
      if (!ttlMs) return false;
      const age = Date.now() - (state.dataUpdatedAt ?? 0);
      return age > ttlMs;
    });
  }, [list, enabled, ttlMs, qc, makeKey, getId]);

  useEffect(() => {
    let cancelled = false;
    if (!enabled || !idsToFetch.length) {
      // no hay nada que calentar
      if (!enabled) {
        setRunning(false);
        setDone(false);
        setQueued(0);
      } else {
        setRunning(false);
        setDone(true);
        setQueued(0);
      }
      return;
    }

    const localRun = ++runId.current;
    setRunning(true);
    setDone(false);
    setQueued(idsToFetch.length);

    const controller = new AbortController();

    (async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setRunning(false);
        setDone(false);
        return;
      }

      const tasks = idsToFetch.map((id) => async () => {
        if (cancelled || runId.current !== localRun) return;
        try {
          await qc.prefetchQuery({
            queryKey: makeKey(id),
            queryFn: ({signal}) => fetcher(id, {signal}),
            staleTime: ttlMs,
            retry: 1,
            retryDelay: 400,
          });
        } catch {}
      });

      await promisePool(tasks, concurrency);
      if (!cancelled && runId.current === localRun) {
        setRunning(false);
        setDone(true);
        setQueued(0);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [idsToFetch, enabled, ttlMs, concurrency, fetcher, makeKey, qc]);

  return {running, done, queued};
}

type SeedOpts<T> = {
  /** Si quieres transformar un poco el item antes de guardar */
  map?: (item: T) => T;
  replace?: boolean; // default true
};

export function seedDetailsFromList<T>(
  qc: QueryClient,
  list: T[] | undefined,
  getId: (item: T) => string | number,
  makeKey: (id: string | number) => QueryKey,
  opts: SeedOpts<T> = {},
) {
  if (!list?.length) return;
  const map = opts.map ?? ((x: T) => x);
  const replace = opts.replace ?? true;

  for (const item of list) {
    const id = getId(item);
    const key = makeKey(id);
    const mapped = map(item);
    qc.setQueryData<T | undefined>(key, (old) =>
      replace ? mapped : ({...(old ?? {}), ...mapped} as T),
    );
  }
}
