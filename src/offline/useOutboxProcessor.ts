import NetInfo from '@react-native-community/netinfo';
import { setProcessingPersisted, isProcessingPersisted, getQueue, writeQueue } from './outbox';
import { QueryClient } from '@tanstack/react-query';
import { taskServices } from '@api/services/taskServices'; // adapta
import { OutboxItem } from './types';

// tiempo de espera entre reintentos cuando hay error (exponencial)
const backoff = (attempts: number) => Math.min(60_000, 1000 * Math.pow(2, attempts));

let inMemoryProcessing = false; // protección en memoria para no reentrar en la misma sesión

async function safeRunOne(it: OutboxItem) {
  switch (it.kind) {
    case 'note/create': {
      // IMPORTANTE: incluir clientId/idempotencyKey en la petición para que el server lo reconozca
      // y no cree duplicados. El endpoint debería aceptar { clientId, title, description, idJob } y
      // devolver el id real o indicar que ya existe.
      const payload = it.payload as any;
      const res = await taskServices.saveNote({
        idJob: payload.idJob,
        id: undefined,
        // clientId: payload.clientId,
        // idempotencyKey: payload.idempotencyKey,
        title: payload.title,
        description: payload.description,
      });
      return res;
    }
    case 'note/update': {
      const payload = it.payload as any;
      const res = await taskServices.saveNote({
        idJob: payload.idJob,
        id: payload.id, // may be undefined if server id unknown
        // clientId: payload.clientId,
        // idempotencyKey: payload.idempotencyKey,
        title: payload.title,
        description: payload.description,
      });
      return res;
    }
    case 'note/delete': {
      const payload = it.payload as any;
      // if id exists, prefer delete by id; if not, attempt delete by clientId (server must support)
      if (payload.id) {
        const res = await taskServices.deleteNote({ id: payload.id });
        return res;
    //   } else if (payload.clientId) {
    //     const res = await taskServices.deleteNoteByClientId({ clientId: payload.clientId });
    //     return res;
      } else {
        // nothing to do
        return true;
      }
    }
  }
}

export async function processQueueOnce(qc: QueryClient) {
  if (inMemoryProcessing) return;
  if (isProcessingPersisted()) return; // otro proceso persistente en otra session/device?
  inMemoryProcessing = true;
  setProcessingPersisted(true);

  try {
    let queue = getQueue();

    // toma sólo items con status pending o failed (para reintento)
    for (const item of queue.filter(i => i.status === 'pending' || i.status === 'failed')) {
      // actualizar estado -> in_progress y persistir inmediatamente para evitar dobles
      item.status = 'in_progress';
      item.attempts = (item.attempts ?? 0) + 1;
      writeQueue(queue);

      try {
        const r = await safeRunOne(item);
        // si backend devuelve objeto o éxito -> quitar o marcar succeeded
        // Aqui asumimos que un "true"/objecto significa éxito
        item.status = 'succeeded';
        item.lastError = null;
        writeQueue(queue);

        // después de éxito: invalidar cache para reconciliar ids
        if (item.payload && item.payload.idJob) {
          qc.invalidateQueries({ queryKey: ['notes', { idJob: item.payload.idJob }] });
        }
      } catch (err: any) {
        // fallo -> marcar failed, set lastError, leave in queue for retry
        item.status = 'failed';
        item.lastError = String(err?.message ?? err);
        writeQueue(queue);

        // backoff antes de seguir al siguiente item
        const delay = backoff(item.attempts ?? 1);
        await new Promise(res => setTimeout(res, delay));
      }

      // refresh local queue variable
      queue = getQueue();
    }

    // limpiar items succeeded
    const remaining = getQueue().filter(i => i.status !== 'succeeded');
    writeQueue(remaining);
  } finally {
    inMemoryProcessing = false;
    setProcessingPersisted(false);
  }
}

/**
 * Hook para suscribirse a NetInfo/AppState con debounce y evitar reentradas.
 */
import { useEffect } from 'react';
import { AppState } from 'react-native';

export function useOutboxProcessor(qc: QueryClient) {
  useEffect(() => {
    let timer: any = null;
    const trigger = () => {
      if (timer) clearTimeout(timer);
      // debounce 700ms para evitar múltiples triggers seguidos
      timer = setTimeout(() => {
        NetInfo.fetch().then(s => {
          if (s.isConnected && s.isInternetReachable !== false) {
            processQueueOnce(qc).catch(e => console.warn('processQueueOnce error', e));
          }
        });
      }, 700);
    };

    const unsubNet = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable !== false) trigger();
    });

    const unsubApp = AppState.addEventListener('change', status => {
      if (status === 'active') trigger();
    });

    // run once at mount (if online)
    trigger();

    return () => {
      unsubNet && unsubNet();
      unsubApp.remove();
      if (timer) clearTimeout(timer);
    };
  }, [qc]);
}
