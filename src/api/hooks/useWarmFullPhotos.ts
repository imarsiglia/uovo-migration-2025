// useWarmFullPhotos.ts
import {useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import {promisePool} from '@utils/functions';
import {TaskImageType, TaskPhotoType} from '@api/types/Task';
import {
  fullPhotoQueryById,
  localPhotoQueryByClientId,
} from '@api/queries/fullPhotoQuery';

/**
 * Prefetch de fotos en alta (y locales) con control de concurrencia y TTL.
 */
export function useWarmFullPhotos(params: {
  groups?: TaskImageType[];
  enabled?: boolean;
  concurrency?: number;
  ttlMs?: number;
  maxPrefetch?: number;
}) {
  const {
    groups,
    enabled = true,
    concurrency = 4,
    ttlMs = 0,
    maxPrefetch = 200,
  } = params;
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    if (!enabled || !groups?.length) return;

    (async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) return;

      // 1) Aplanar fotos con su groupRev
      const entries: Array<{
        photo: TaskPhotoType;
        groupRev: string | undefined;
      }> = [];
      for (const g of groups) {
        const groupRev = g?.update_time ?? undefined;
        if (!g?.photos?.length) continue;
        for (const p of g.photos) {
          entries.push({photo: p, groupRev});
          if (entries.length >= maxPrefetch) break;
        }
        if (entries.length >= maxPrefetch) break;
      }

      // 2) Crear tareas de prefetch para cada foto (online/offline)
      const tasks = entries.map(({photo, groupRev}) => {
        const q = photo.id
          ? fullPhotoQueryById({id: photo.id!, groupRev})
          : photo.clientId && photo.photo
          ? localPhotoQueryByClientId({
              clientId: photo.clientId!,
              base64: photo.photo!,
              groupRev,
            })
          : undefined;

        if (!q) return async () => {};

        // TTL: si ya existe y es “fresco”, saltamos
        const shouldSkip = () => {
          const state = qc.getQueryState(q.key);
          if (!state?.data) return false;
          if (!ttlMs) return true; // hay data y no usamos TTL => skip
          const age = Date.now() - (state.dataUpdatedAt ?? 0);
          return age < ttlMs;
        };

        return async () => {
          if (cancelled || shouldSkip()) return;
          try {
            await qc.prefetchQuery({
              queryKey: q.key,
              queryFn: q.fn,
              staleTime: Infinity, // clave (incluye rev) controla la “frescura”
              gcTime: q.gcTime,
            });
          } catch {
            // silenciamos errores de prefetch
          }
        };
      });

      // 3) Ejecutar en pool con concurrencia
      await promisePool(tasks, concurrency);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    qc,
    concurrency,
    ttlMs,
    maxPrefetch,
    // clave para evitar loops: serializa lo necesario
    JSON.stringify(
      (groups ?? []).map((g) => ({
        rev: g.update_time,
        count: g.photos?.length ?? 0,
        // no metemos todos los base64 aquí para no re-disparar por cada char,
        // sólo el número (las offline se invalidan por groupRev cuando toque).
      })),
    ),
  ]);
}
