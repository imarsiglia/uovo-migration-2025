// src/offline/outboxStatus.ts
import { readQueue } from '@offline/outbox';
import type { OutboxItem, OutboxStatus } from '@offline/types';

/**
 * Verifica si hay items pendientes de sincronizar para una entidad específica
 * @param entity - El nombre de la entidad o array de entidades (ej: 'NOTES' o ['NOTES', 'REPORTS'])
 * @param idJob - (Opcional) ID del trabajo para filtrar
 * @returns true si hay items pending o in_progress para esa entidad
 */
export async function hasPendingSync(
  entity: string | string[], 
  idJob?: number
): Promise<boolean> {
  const queue = await readQueue();
  const entities = Array.isArray(entity) ? entity : [entity];
  
  return queue.some(
    (item) => {
      const matchesEntity = entities.includes(item.payload?.entity ?? '');
      const matchesStatus = item.status === 'pending' || item.status === 'in_progress';
      
      if (idJob !== undefined) {
        const itemJobId = Number(item.payload?.idJob ?? 0);
        return matchesEntity && matchesStatus && itemJobId === idJob;
      }
      
      return matchesEntity && matchesStatus;
    }
  );
}

/**
 * Obtiene el conteo de items por estado para una entidad específica
 * @param entity - El nombre de la entidad o array de entidades
 * @param idJob - (Opcional) ID del trabajo para filtrar
 * @returns Objeto con contadores por estado
 */
export async function getSyncStatusForEntity(
  entity: string | string[], 
  idJob?: number
): Promise<{
  pending: number;
  in_progress: number;
  succeeded: number;
  failed: number;
  total: number;
}> {
  const queue = await readQueue();
  const entities = Array.isArray(entity) ? entity : [entity];
  
  const filtered = queue.filter((item) => {
    const matchesEntity = entities.includes(item.payload?.entity ?? '');
    
    if (idJob !== undefined) {
      const itemJobId = Number(item.payload?.idJob ?? 0);
      return matchesEntity && itemJobId === idJob;
    }
    
    return matchesEntity;
  });
  
  const counts = {
    pending: 0,
    in_progress: 0,
    succeeded: 0,
    failed: 0,
  };
  
  for (const item of filtered) {
    counts[item.status] += 1;
  }
  
  return {
    ...counts,
    total: filtered.length,
  };
}

/**
 * Verifica si hay items con cualquiera de los estados especificados para una entidad
 * @param entity - El nombre de la entidad o array de entidades
 * @param statuses - Array de estados a verificar (por defecto: pending e in_progress)
 * @param idJob - (Opcional) ID del trabajo para filtrar
 * @returns true si hay items con alguno de los estados
 */
export async function hasItemsWithStatus(
  entity: string | string[],
  statuses: OutboxStatus[] = ['pending', 'in_progress'],
  idJob?: number
): Promise<boolean> {
  const queue = await readQueue();
  const entities = Array.isArray(entity) ? entity : [entity];
  
  return queue.some(
    (item) => {
      const matchesEntity = entities.includes(item.payload?.entity ?? '');
      const matchesStatus = statuses.includes(item.status);
      
      if (idJob !== undefined) {
        const itemJobId = Number(item.payload?.idJob ?? 0);
        return matchesEntity && matchesStatus && itemJobId === idJob;
      }
      
      return matchesEntity && matchesStatus;
    }
  );
}

/**
 * Obtiene todos los items de una entidad específica
 * @param entity - El nombre de la entidad o array de entidades
 * @param idJob - (Opcional) ID del trabajo para filtrar
 * @returns Array de items de esa entidad
 */
export async function getItemsForEntity(
  entity: string | string[], 
  idJob?: number
): Promise<OutboxItem[]> {
  const queue = await readQueue();
  const entities = Array.isArray(entity) ? entity : [entity];
  
  return queue.filter((item) => {
    const matchesEntity = entities.includes(item.payload?.entity ?? '');
    
    if (idJob !== undefined) {
      const itemJobId = Number(item.payload?.idJob ?? 0);
      return matchesEntity && itemJobId === idJob;
    }
    
    return matchesEntity;
  });
}

/**
 * Verifica si hay algún item failed para una entidad
 * @param entity - El nombre de la entidad o array de entidades
 * @param idJob - (Opcional) ID del trabajo para filtrar
 * @returns true si hay items con estado failed
 */
export async function hasFailedSync(
  entity: string | string[], 
  idJob?: number
): Promise<boolean> {
  return hasItemsWithStatus(entity, ['failed'], idJob);
}

/**
 * Obtiene un resumen de sincronización para un trabajo específico
 * Agrupa por entidad todos los items de ese trabajo
 * @param idJob - ID del trabajo
 * @returns Map con el nombre de la entidad y su conteo de items pendientes/in_progress
 */
export async function getPendingSyncByJob(idJob: number): Promise<Map<string, number>> {
  const queue = await readQueue();
  const summary = new Map<string, number>();
  
  for (const item of queue) {
    const itemJobId = Number(item.payload?.idJob ?? 0);
    
    if (itemJobId === idJob && (item.status === 'pending' || item.status === 'in_progress')) {
      const entity = item.payload?.entity;
      if (entity) {
        summary.set(entity, (summary.get(entity) || 0) + 1);
      }
    }
  }
  
  return summary;
}

/**
 * Verifica si un trabajo específico tiene CUALQUIER item pendiente
 * @param idJob - ID del trabajo
 * @returns true si hay algún item pending o in_progress para ese trabajo
 */
export async function hasAnyPendingSyncForJob(idJob: number): Promise<boolean> {
  const queue = await readQueue();
  
  return queue.some(
    (item) => {
      const itemJobId = Number(item.payload?.idJob ?? 0);
      return itemJobId === idJob && (item.status === 'pending' || item.status === 'in_progress');
    }
  );
}

/**
 * Obtiene todos los idJob que tienen items pendientes de sincronizar
 * Útil para mostrar indicadores en listados de trabajos
 * @returns Set con los IDs de trabajos que tienen items pendientes
 */
export async function getJobsWithPendingSync(): Promise<Set<number>> {
  const queue = await readQueue();
  const jobIds = new Set<number>();
  
  for (const item of queue) {
    if (item.status === 'pending' || item.status === 'in_progress') {
      const itemJobId = Number(item.payload?.idJob ?? 0);
      if (itemJobId > 0) {
        jobIds.add(itemJobId);
      }
    }
  }
  
  return jobIds;
}

/**
 * Obtiene un resumen completo de un trabajo específico
 * @param idJob - ID del trabajo
 * @returns Objeto con detalles completos de sincronización del trabajo
 */
export async function getJobSyncDetails(idJob: number): Promise<{
  hasPending: boolean;
  totalPending: number;
  totalFailed: number;
  byEntity: Record<string, {
    pending: number;
    in_progress: number;
    succeeded: number;
    failed: number;
  }>;
}> {
  const queue = await readQueue();
  const jobItems = queue.filter(item => {
    const itemJobId = Number(item.payload?.idJob ?? 0);
    return itemJobId === idJob;
  });
  
  const byEntity: Record<string, any> = {};
  let totalPending = 0;
  let totalFailed = 0;
  
  for (const item of jobItems) {
    const entity = item.payload?.entity;
    if (!entity) continue;
    
    if (!byEntity[entity]) {
      byEntity[entity] = {
        pending: 0,
        in_progress: 0,
        succeeded: 0,
        failed: 0,
      };
    }
    
    byEntity[entity][item.status] += 1;
    
    if (item.status === 'pending' || item.status === 'in_progress') {
      totalPending += 1;
    }
    if (item.status === 'failed') {
      totalFailed += 1;
    }
  }
  
  return {
    hasPending: totalPending > 0,
    totalPending,
    totalFailed,
    byEntity,
  };
}

/**
 * Verifica si hay CUALQUIER item pendiente de sincronizar (útil para mostrar indicador global)
 * @returns true si hay algún item pending o in_progress
 */
export async function hasAnyPendingSync(): Promise<boolean> {
  const queue = await readQueue();
  
  return queue.some(
    (item) => item.status === 'pending' || item.status === 'in_progress'
  );
}