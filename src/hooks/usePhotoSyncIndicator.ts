import {useState, useEffect, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {readQueue} from '@offline/outbox';
import {outboxEvents} from '@offline/outboxEvents';
import type {OutboxItem} from '@offline/types';
import {ENTITY_TYPES} from '@api/contants/constants';

interface PhotoSyncFilters {
  idJob?: number;
  conditionType?: string | string[]; // ej: 'ConditionReport', 'ConditionCheck'
  type?: string | string[]; // ej: 'BEFORE', 'AFTER', 'DAMAGE'
  idJobInventory?: number;
}

interface PhotoSyncResult {
  hasPending: boolean;
  counts: {
    pending: number;
    in_progress: number;
    succeeded: number;
    failed: number;
    total: number;
  };
  items: OutboxItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Verifica si un item de foto coincide con los filtros
 */
function matchesPhotoFilters(
  item: OutboxItem,
  filters: PhotoSyncFilters,
): boolean {
  const {payload} = item;
  const {body} = payload || {};

  // Solo procesar fotos
  const photoEntities = [
    ENTITY_TYPES.CONDITION_PHOTO,
    ENTITY_TYPES.CONDITION_ZOOM_PHOTO,
  ];
  if (!photoEntities.includes(payload?.entity ?? '')) {
    return false;
  }

  // Filtrar por idJob
  if (filters.idJob !== undefined) {
    const itemJobId = Number(payload?.idJob ?? 0);
    if (itemJobId !== filters.idJob) {
      return false;
    }
  }

  // Filtrar por conditionType
  if (filters.conditionType !== undefined) {
    const conditionTypes = Array.isArray(filters.conditionType)
      ? filters.conditionType
      : [filters.conditionType];

    const itemConditionType = body?.conditionType;
    if (!itemConditionType || !conditionTypes.includes(itemConditionType)) {
      return false;
    }
  }

  // Filtrar por type
  if (filters.type !== undefined) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type];
    const itemType = body?.reportType || body?.type;
    if (!itemType || !types.includes(itemType)) {
      return false;
    }
  }

  // Filtrar por idJobInventory
  if (filters.idJobInventory !== undefined) {
    const itemIdJobInventory = Number(body?.idJobInventory ?? 0);
    if (itemIdJobInventory !== filters.idJobInventory) {
      return false;
    }
  }

  return true;
}

/**
 * Obtiene items de fotos que coinciden con los filtros
 */
async function getPhotoItems(
  filters: PhotoSyncFilters,
  statuses?: ('pending' | 'in_progress' | 'succeeded' | 'failed')[],
): Promise<OutboxItem[]> {
  const queue = await readQueue();

  return queue.filter((item) => {
    const matchesFilter = matchesPhotoFilters(item, filters);

    if (statuses && statuses.length > 0) {
      return matchesFilter && statuses.includes(item.status as any);
    }

    return matchesFilter;
  });
}

/**
 * Hook para validar fotos pendientes con filtros específicos
 * Se actualiza automáticamente cuando cambia la cola
 *
 * @param filters - Objeto con los filtros a aplicar
 * @param pollInterval - Intervalo en ms para verificar automáticamente (opcional)
 *
 * @example
 * // Fotos de un trabajo específico
 * const { hasPending, counts } = usePhotoSyncIndicator({ idJob: 123 });
 *
 * @example
 * // Fotos tipo BEFORE de ConditionReport
 * const { hasPending } = usePhotoSyncIndicator({
 *   idJob: 123,
 *   conditionType: 'ConditionReport',
 *   type: 'BEFORE'
 * });
 *
 * @example
 * // Fotos de un inventario específico
 * const { hasPending, items } = usePhotoSyncIndicator({
 *   idJobInventory: 456
 * });
 *
 * @example
 * // Múltiples conditionTypes
 * const { hasPending } = usePhotoSyncIndicator({
 *   idJob: 123,
 *   conditionType: ['ConditionReport', 'ConditionCheck']
 * });
 */
export function usePhotoSyncIndicator(
  filters: PhotoSyncFilters,
  pollInterval?: number,
): PhotoSyncResult {
  const [hasPending, setHasPending] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    in_progress: 0,
    succeeded: 0,
    failed: 0,
    total: 0,
  });
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Serializar filtros para dependencias
  const filtersKey = JSON.stringify({
    idJob: filters.idJob,
    conditionType: filters.conditionType,
    type: filters.type,
    idJobInventory: filters.idJobInventory,
  });

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Obtener todos los items que coinciden
      const allItems = await getPhotoItems(filters);

      // Calcular contadores
      const newCounts = {
        pending: 0,
        in_progress: 0,
        succeeded: 0,
        failed: 0,
        total: allItems.length,
      };

      for (const item of allItems) {
        newCounts[item.status] += 1;
      }

      const pending = newCounts.pending + newCounts.in_progress > 0;

      setHasPending(pending);
      setCounts(newCounts);
      setItems(allItems);
    } catch (error) {
      console.error('Error checking photo sync status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    checkStatus();

    // Escuchar cambios en la cola
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
      unsubscribe();
      subscription.remove();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkStatus, pollInterval]);

  return {
    hasPending,
    counts,
    items,
    isLoading,
    refresh: checkStatus,
  };
}

/**
 * Hook simplificado que solo retorna booleano
 *
 * @example
 * const hasPendingPhotos = useHasPhotosPending({
 *   idJob: 123,
 *   type: 'BEFORE'
 * });
 */
export function useHasPhotosPending(filters: PhotoSyncFilters): boolean {
  const {hasPending} = usePhotoSyncIndicator(filters);
  return hasPending;
}

/**
 * Hook para obtener el conteo de fotos pendientes
 *
 * @example
 * const count = usePhotosPendingCount({ idJob: 123 });
 * return <Badge>{count}</Badge>;
 */
export function usePhotosPendingCount(filters: PhotoSyncFilters): number {
  const {counts} = usePhotoSyncIndicator(filters);
  return counts.pending + counts.in_progress;
}

/**
 * Hook para validar si hay fotos CONDITION_PHOTO o CONDITION_ZOOM_PHOTO
 * de cualquier tipo en un trabajo
 *
 * @example
 * const hasAnyPhotos = useHasAnyPhotosPending(123);
 */
export function useHasAnyPhotosPending(idJob: number): boolean {
  return useHasPhotosPending({idJob});
}

/**
 * Hook para validar fotos por conditionType específico
 *
 * @example
 * // Solo fotos de ConditionReport
 * const hasReportPhotos = useHasPhotosForConditionType(123, 'ConditionReport');
 */
export function useHasPhotosForConditionType(
  idJob: number,
  conditionType: string | string[],
): boolean {
  return useHasPhotosPending({idJob, conditionType});
}

/**
 * Hook para validar fotos de un inventario específico
 *
 * @example
 * const hasInventoryPhotos = useHasInventoryPhotosPending(456);
 */
export function useHasInventoryPhotosPending(idJobInventory: number): boolean {
  return useHasPhotosPending({idJobInventory});
}
