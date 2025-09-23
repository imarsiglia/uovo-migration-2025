import {MMKV} from 'react-native-mmkv';
import {OutboxItem, OutboxStatus, OutboxKind} from './types';
import {v4 as uuid} from 'uuid';
import {NoteType} from '@api/types/Task';

const STORE_ID = 'offline-outbox-v2';
const KEY = 'OUTBOX_QUEUE';
const PROCESS_FLAG = 'OUTBOX_PROCESSING_FLAG'; // marca persistente para non-reentrant

const store = new MMKV({id: STORE_ID});

const readQueue = (): OutboxItem[] => {
  const raw = store.getString(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxItem[];
  } catch {
    return [];
  }
};

export const writeQueue = (q: OutboxItem[]) =>
  store.set(KEY, JSON.stringify(q));

export const isProcessingPersisted = (): boolean => {
  return !!store.getString(PROCESS_FLAG);
};

export const setProcessingPersisted = (val: boolean) => {
  if (val) store.set(PROCESS_FLAG, String(Date.now()));
  else store.delete(PROCESS_FLAG);
};

export const getQueue = () => readQueue();

export const clearQueue = () => writeQueue([]);

/**
 * ENQUEUE con COALESCE inteligente
 * - Si haces create -> update: combina en single create con datos actualizados.
 * - Si haces create -> delete (antes de sync): quita ambas (no es necesario llamar al server).
 * - Si haces update -> delete: deja solo delete (con id si existe).
 */
export const enqueueCoalesced = (kind: OutboxKind, payload: NoteType) => {
  const q = readQueue();
  const now = Date.now();
  const match = (it: OutboxItem) => {
    const p = it.payload;
    if (payload.clientId && p.clientId) return p.clientId === payload.clientId;
    if (payload.id && p.id) return p.id === payload.id;
    return false;
  };
  const idx = q.findIndex(match);

  if (idx === -1) {
    const item: OutboxItem = {
      uid: uuid(),
      kind,
      createdAt: now,
      attempts: 0,
      status: 'pending',
      lastError: null,
      payload: {...payload},
    };
    q.push(item);
    writeQueue(q);
    return item.uid;
  }

  const existing = q[idx];

  // Helper para reemplazar
  const replaceAt = (i: number, it: OutboxItem | null) => {
    if (it === null) q.splice(i, 1);
    else q[i] = it;
    writeQueue(q);
  };

  // Reglas
  if (existing.kind === 'note/create') {
    if (kind === 'note/update') {
      // merge update into create => keep create with updated payload
      const merged = {
        ...existing,
        payload: {...existing.payload, ...payload},
        updatedAt: now,
      };
      replaceAt(idx, merged);
      return;
    }
    if (kind === 'note/delete') {
      // create then delete before sync -> remove both (no op)
      replaceAt(idx, null);
      return;
    }
  }

  if (existing.kind === 'note/update') {
    if (kind === 'note/update') {
      // update+update -> merge to last
      const merged = {
        ...existing,
        payload: {...existing.payload, ...payload},
        updatedAt: now,
      };
      replaceAt(idx, merged);
      return;
    }
    if (kind === 'note/delete') {
      // update then delete -> convert to delete
      const del: OutboxItem = {
        ...existing,
        kind: 'note/delete',
        payload: {
          idJob: payload.idJob,
          id: payload.id ?? existing.payload.id,
          clientId: payload.clientId ?? existing.payload.clientId,
          // idempotencyKey: payload.idempotencyKey ?? existing.payload.idempotencyKey,
        } as NoteType,
        updatedAt: now,
      } as OutboxItem;
      replaceAt(idx, del);
      return;
    }
    if (kind === 'note/create') {
      // improbable: create after update -> treat as update (or push)
      const merged = {
        ...existing,
        payload: {...existing.payload, ...payload},
        updatedAt: now,
      };
      replaceAt(idx, merged);
      return;
    }
  }

  if (existing.kind === 'note/delete') {
    if (kind === 'note/create') {
      // delete then create -> keep create (it could be a re-create)
      const created: OutboxItem = {
        uid: uuid(),
        kind: 'note/create',
        createdAt: now,
        attempts: 0,
        status: 'pending',
        lastError: null,
        payload: {...payload} as NoteType,
      } as OutboxItem;
      // replace delete with create
      replaceAt(idx, created);
      return;
    }
    // if delete exists and another delete -> ignore
    return;
  }

  // fallback: no specific rule -> append
  const item: OutboxItem = {
    uid: uuid(),
    kind,
    createdAt: now,
    attempts: 0,
    status: 'pending',
    lastError: null,
    payload: {...payload} as NoteType,
  } as OutboxItem;
  q.push(item);
  writeQueue(q);
};
