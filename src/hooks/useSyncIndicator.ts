// src/hooks/useSyncIndicator.ts
import {useState, useEffect, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {
  hasPendingSync,
  getSyncStatusForEntity,
  hasAnyPendingSyncForJob,
  getJobSyncDetails,
} from '@offline/outboxStatus';
import {outboxEvents} from '@offline/outboxEvents';
import type {OutboxStatus} from '@offline/types';

interface SyncIndicatorResult {
  hasPending: boolean;
  counts: {
    pending: number;
    in_progress: number;
    succeeded: number;
    failed: number;
    total: number;
  };
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook para verificar si una entidad tiene items pendientes de sincronizar
 * Se actualiza automáticamente cuando cambia la cola de sincronización
 *
 * @param entity - Nombre de la entidad o array de entidades (ej: 'NOTES' o ['NOTES', 'REPORTS'])
 * @param idJob - (Opcional) ID del trabajo para filtrar
 * @param pollInterval - Intervalo en ms para verificar automáticamente (opcional)
 * @returns Estado de sincronización de la entidad
 *
 * @example
 * // Para una entidad
 * const { hasPending, counts } = useSyncIndicator('NOTES');
 *
 * @example
 * // Para múltiples entidades en un trabajo específico
 * const { hasPending } = useSyncIndicator(['REPORT_MATERIALS', 'REPORT_MATERIAL'], idJob);
 *
 * @example
 * // Con polling cada 5 segundos
 * const { hasPending } = useSyncIndicator('NOTES', idJob, 5000);
 */
export function useSyncIndicator(
  entity: string | string[],
  idJob?: number,
  pollInterval?: number,
): SyncIndicatorResult {
  const [hasPending, setHasPending] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    in_progress: 0,
    succeeded: 0,
    failed: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Serializar entity para usarlo en dependencias
  const entityKey = Array.isArray(entity) ? entity.join(',') : entity;

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pending, statusCounts] = await Promise.all([
        hasPendingSync(entity, idJob),
        getSyncStatusForEntity(entity, idJob),
      ]);

      setHasPending(pending);
      setCounts(statusCounts);
    } catch (error) {
      console.error('Error checking sync status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entityKey, idJob]); // 🔥 Usar entityKey en lugar de entity

  useEffect(() => {
    checkStatus();

    // 🔥 Escuchar cambios en la cola
    const unsubscribe = outboxEvents.subscribe(() => {
      checkStatus();
    });

    // Actualizar cuando la app vuelve al foreground
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkStatus();
        }
      },
    );

    // Polling opcional
    // @ts-ignore
    let intervalId: NodeJS.Timeout | undefined;
    if (pollInterval && pollInterval > 0) {
      intervalId = setInterval(checkStatus, pollInterval);
    }

    return () => {
      unsubscribe(); // Desuscribirse de eventos
      subscription.remove();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkStatus, pollInterval]);

  return {
    hasPending,
    counts,
    isLoading,
    refresh: checkStatus,
  };
}

/**
 * Hook simplificado que solo devuelve un booleano
 * Se actualiza automáticamente cuando cambia la cola
 *
 * @param entity - Nombre de la entidad o array de entidades
 * @param idJob - (Opcional) ID del trabajo para filtrar
 *
 * @example
 * // Para una entidad
 * const hasPendingNotes = useHasPendingSync('NOTES');
 *
 * @example
 * // Para múltiples entidades en un trabajo
 * const hasMaterials = useHasPendingSync(['REPORT_MATERIALS', 'REPORT_MATERIAL'], 123);
 */
export function useHasPendingSync(
  entity: string | string[],
  idJob?: number,
): boolean {
  const {hasPending} = useSyncIndicator(entity, idJob);
  return hasPending;
}

/**
 * Hook para verificar si un trabajo tiene CUALQUIER item pendiente
 * Se actualiza automáticamente cuando cambia la cola
 *
 * @param idJob - ID del trabajo
 * @param pollInterval - Intervalo en ms para verificar automáticamente (opcional)
 *
 * @example
 * const hasJobPending = useJobHasPendingSync(123);
 * return hasJobPending ? <Badge>Offline</Badge> : null;
 */
export function useJobHasPendingSync(
  idJob: number,
  pollInterval?: number,
): boolean {
  const [hasPending, setHasPending] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const pending = await hasAnyPendingSyncForJob(idJob);
      setHasPending(pending);
    } catch (error) {
      console.error('Error checking job sync status:', error);
    }
  }, [idJob]); // 🔥 Solo depende de idJob

  useEffect(() => {
    checkStatus();

    // 🔥 Escuchar cambios en la cola
    const unsubscribe = outboxEvents.subscribe(() => {
      checkStatus();
    });

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkStatus();
        }
      },
    );
    // @ts-ignore
    let intervalId: NodeJS.Timeout | undefined;
    if (pollInterval && pollInterval > 0) {
      intervalId = setInterval(checkStatus, pollInterval);
    }

    return () => {
      unsubscribe(); // Desuscribirse de eventos
      subscription.remove();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkStatus, pollInterval]);

  return hasPending;
}

/**
 * Hook para obtener detalles completos de sincronización de un trabajo
 * Se actualiza automáticamente cuando cambia la cola
 *
 * @param idJob - ID del trabajo
 * @param pollInterval - Intervalo en ms para verificar automáticamente (opcional)
 *
 * @example
 * const { hasPending, totalPending, byEntity } = useJobSyncDetails(123);
 */
export function useJobSyncDetails(
  idJob: number,
  pollInterval?: number,
): {
  hasPending: boolean;
  totalPending: number;
  totalFailed: number;
  byEntity: Record<
    string,
    {
      pending: number;
      in_progress: number;
      succeeded: number;
      failed: number;
    }
  >;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [details, setDetails] = useState({
    hasPending: false,
    totalPending: 0,
    totalFailed: 0,
    byEntity: {} as Record<string, any>,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const jobDetails = await getJobSyncDetails(idJob);
      setDetails(jobDetails);
    } catch (error) {
      console.error('Error checking job sync details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [idJob]); // 🔥 Solo depende de idJob

  useEffect(() => {
    checkStatus();

    // 🔥 Escuchar cambios en la cola
    const unsubscribe = outboxEvents.subscribe(() => {
      checkStatus();
    });

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkStatus();
        }
      },
    );

    // @ts-ignore
    let intervalId: NodeJS.Timeout | undefined;
    if (pollInterval && pollInterval > 0) {
      intervalId = setInterval(checkStatus, pollInterval);
    }

    return () => {
      unsubscribe(); // Desuscribirse de eventos
      subscription.remove();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkStatus, pollInterval]);

  return {
    ...details,
    isLoading,
    refresh: checkStatus,
  };
}
