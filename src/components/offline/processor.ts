// src/offline/processor.ts
import NetInfo from '@react-native-community/netinfo';
import {AppState} from 'react-native';
import {QueryClient} from '@tanstack/react-query';

let inMemoryProcessing = false;
const MAX_BACKOFF_MS = 60_000;
const DEFAULT_MATCH_WINDOW_MS = 2 * 60 * 1000; // 2 minutes for heuristic matches

const backoff = (attempts: number) =>
  Math.min(MAX_BACKOFF_MS, 1000 * Math.pow(2, attempts));

/**
 * Heurística conservadora para emparejar un item local (payload.body) con un item del servidor.
 * Compara keys del body que existan en serverItem; si está clientCreatedAt disponible lo usa.
 */
function heuristicsMatchLocalToServer(localPayload: any, serverItem: any) {
  if (!localPayload || !serverItem) return false;

  const localBody = localPayload.body ?? {};
  // require at least one field to compare (title/description typical)
  const keys = Object.keys(localBody);
  if (keys.length === 0) return false;

  for (const k of keys) {
    if (serverItem[k] !== (localBody as any)[k]) return false;
  }

  // if localCreatedAt present and server createdAt available, check proximity
  if (localPayload.clientCreatedAt && serverItem.createdAt) {
    const delta = Math.abs(
      new Date(serverItem.createdAt).getTime() - localPayload.clientCreatedAt,
    );
    if (delta > DEFAULT_MATCH_WINDOW_MS) return false;
  }

  return true;
}

/**
 * handleCreateResult: cuando el backend solo devuelve boolean TRUE al crear,
 * intentamos reconciliar haciendo refetch de la lista de la entidad y buscando
 * un match conservador (por contenido + tiempo).
 */
async function handleCreateResult(it: OutboxItem, qc: QueryClient) {
  const p = it.payload;
  const entity = p.entity;
  const idJob = p.idJob;

  // resolve queryKey via adapter so it's consistent with how your hooks request data
  const queryKey = entityServices.getQueryKeyForEntity(entity, {idJob});

  // invalidate and fetch fresh
  try {
    await qc.invalidateQueries({queryKey});
    // small delay to let queries fetch (or use fetchQuery if preferred)
    await sleep(300);
  } catch (e) {
    // ignore; we'll still try to read cache
  }

  const list = qc.getQueryData<any[]>(queryKey) ?? [];
  const match = list.find((s) => heuristicsMatchLocalToServer(p, s));

  if (match) {
    // map local clientId to server object in cache
    const mapped = (qc.getQueryData<any[]>(queryKey) ?? []).map((n) =>
      n.clientId && p.clientId && n.clientId === p.clientId
        ? {...match, pending: false}
        : n,
    );
    qc.setQueryData(queryKey, mapped);
    return {matched: true, serverId: match.id};
  } else {
    // no match: to avoid duplicate creates, mark succeeded and log for telemetry
    console.warn(
      `[OUTBOX] create returned true but no match found for clientId=${p.clientId} entity=${entity}`,
    );
    // ensure cache updated with authoritative list
    await qc.invalidateQueries({queryKey});
    return {matched: false};
  }
}

/**
 * safeRunOne: Ejecuta la operación delegando al entityServices adapter.
 * No hace disponibilidad por entidad: el adapter debe manejar las llamadas correctas.
 */
async function safeRunOne(it: OutboxItem, qc: QueryClient) {
  const {op, payload} = it;
  const entity = payload.entity;
  // meta pasa idJob y demás
  const meta = {
    idJob: payload.idJob,
    clientId: payload.clientId,
    clientCreatedAt: payload.clientCreatedAt,
  };

  if (op === 'create') {
    return await entityServices.createEntity({
      entity,
      body: payload.body ?? {},
      meta,
    });
  }

  if (op === 'update') {
    // prefer server id if present
    return await entityServices.updateEntity({
      entity,
      id: payload.id,
      body: payload.body ?? {},
      meta,
    });
  }

  if (op === 'delete') {
    return await entityServices.deleteEntity({entity, id: payload.id, meta});
  }

  throw new Error('Unknown op');
}

/**
 * processQueueOnce: ejecución atómica / no-reentrant del outbox
 */
export async function processQueueOnce(qc: QueryClient) {
  if (inMemoryProcessing) return;
  if (isProcessingPersisted()) return;

  inMemoryProcessing = true;
  setProcessingPersisted(true);

  try {
    let queue = getQueue();

    for (let i = 0; i < queue.length; i++) {
      const it = queue[i];
      if (it.status === 'succeeded') continue;

      // marca in_progress y persiste
      it.status = 'in_progress';
      it.attempts = (it.attempts ?? 0) + 1;
      replaceQueue(queue);

      try {
        const res = await safeRunOne(it, qc);

        // Special reconciliation when create returned boolean true
        if (it.op === 'create') {
          if (res && typeof res === 'object' && (res as any).id) {
            // server returned created object -> map local clientId -> server object
            const serverId = (res as any).id;
            const qk = entityServices.getQueryKeyForEntity(it.payload.entity, {
              idJob: it.payload.idJob,
            });
            const current = qc.getQueryData<any[]>(qk) ?? [];
            const mapped = current.map((n) =>
              n.clientId &&
              it.payload.clientId &&
              n.clientId === it.payload.clientId
                ? {...res, pending: false}
                : n,
            );
            qc.setQueryData(qk, mapped);
          } else if (res === true) {
            // server returned true -> try heuristic reconciliation
            await handleCreateResult(it, qc);
          } else {
            throw new Error('Create failed on server');
          }
        }

        // For update/delete -> invalidate to get authoritative state
        if (it.op === 'update' || it.op === 'delete') {
          const qk = entityServices.getQueryKeyForEntity(it.payload.entity, {
            idJob: it.payload.idJob,
          });
          await qc.invalidateQueries({queryKey: qk});
        }

        // mark succeeded and persist
        it.status = 'succeeded';
        it.lastError = null;
        replaceQueue(getQueue());

        // cleanup: remove other related items referencing same clientId or server id
        const remaining = getQueue().filter((x) => {
          const p = x.payload;
          if (it.payload.clientId && p.clientId === it.payload.clientId)
            return false;
          if (it.payload.id && p.id === it.payload.id) return false;
          return true;
        });
        replaceQueue(remaining);
      } catch (err: any) {
        // fallo: marca failed y persiste, aplica backoff antes de continuar
        it.status = 'failed';
        it.lastError = String(err?.message ?? err);
        replaceQueue(queue);

        const delay = backoff(it.attempts ?? 1);
        await sleep(delay);
      }

      // refresh queue var
      queue = getQueue();
    }

    // limpiar succeeded
    const final = getQueue().filter((x) => x.status !== 'succeeded');
    replaceQueue(final);
  } finally {
    inMemoryProcessing = false;
    setProcessingPersisted(false);
  }
}

/**
 * Hook que suscribe NetInfo + AppState y dispara processQueueOnce con debounce.
 * Debe montarse a nivel app (ej: AppProviders) con queryClient.
 */
import {useEffect} from 'react';
import {OutboxItem} from '@offline/types';
import {entityServices} from '@api/services/entityServices';
import {sleep} from '@utils/functions';
import {
  getQueue,
  isProcessingPersisted,
  replaceQueue,
  setProcessingPersisted,
} from '@offline/outbox';
export function useOutboxProcessor(qc: QueryClient) {
  useEffect(() => {
    let timer: any = null;
    const trigger = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        NetInfo.fetch().then((s) => {
          if (s.isConnected && s.isInternetReachable !== false) {
            processQueueOnce(qc).catch((e) =>
              console.warn('[OUTBOX] processQueueOnce error', e),
            );
          }
        });
      }, 600);
    };

    const unsubNet = NetInfo.addEventListener((s) => {
      if (s.isConnected && s.isInternetReachable !== false) trigger();
    });

    const unsubApp = AppState.addEventListener('change', (status) => {
      if (status === 'active') trigger();
    });

    // initial try
    trigger();

    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
      if (timer) clearTimeout(timer);
    };
  }, [qc]);
}
