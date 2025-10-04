// src/offline/outbox.ts
import 'react-native-get-random-values';
import { MMKV } from 'react-native-mmkv';
import { v4 as uuid } from 'uuid';
import type { OutboxItem, GenericPayload, OutboxOpKind } from './types';

const STORE_ID = 'uovo-offbox-v1';
const KEY = 'OUTBOX_QUEUE_V1';
const PROC_FLAG = 'OUTBOX_PROCESSING_FLAG_V1';

const store = new MMKV({ id: STORE_ID });

export const readQueue = (): OutboxItem[] => {
  const raw = store.getString(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxItem[];
  } catch (e) {
    console.warn('[OUTBOX] parse error', e);
    return [];
  }
};

export const writeQueue = (q: OutboxItem[]) => {
  try {
    store.set(KEY, JSON.stringify(q));
  } catch (e) {
    console.warn('[OUTBOX] writeQueue error', e);
  }
};

export const getQueue = () => readQueue();
export const replaceQueue = (newQ: OutboxItem[]) => writeQueue(newQ);
export const clearQueue = () => writeQueue([]);
export const isProcessingPersisted = () => !!store.getString(PROC_FLAG);
export const setProcessingPersisted = (val: boolean) => {
  if (val) store.set(PROC_FLAG, String(Date.now()));
  else store.delete(PROC_FLAG);
};

/**
 * enqueueCoalesced: agrega operación a la cola y aplica reglas de coalescing por (entity + clientId|id)
 * Retorna uid del item creado o el uid existente si se coalesció; retorna null si la operación se anuló (create+delete)
 */
export const enqueueCoalesced = (op: OutboxOpKind, payload: GenericPayload): string | null => {
  const q = readQueue();
  const now = Date.now();

  const match = (it: OutboxItem) => {
    const p = it.payload;
    if (payload.clientId && p.clientId) return p.clientId === payload.clientId && p.entity === payload.entity;
    if (payload.id && p.id) return p.id === payload.id && p.entity === payload.entity;
    // fallback: if entity and idJob match and body has an identifier you could match, but avoid heuristics here
    return false;
  };

  const idx = q.findIndex(match);

  if (idx === -1) {
    const item: OutboxItem = {
      uid: uuid(),
      op,
      createdAt: now,
      attempts: 0,
      status: 'pending',
      lastError: null,
      payload: { ...payload },
      updatedAt: now,
    };
    q.push(item);
    writeQueue(q);
    return item.uid;
  }

  const existing = q[idx];

  // Reglas de coalescing:
  // existing.create + new.update => merge into create (update payload)
  // existing.create + new.delete => remove existing (no op)
  // existing.update + new.update => merge (last wins)
  // existing.update + new.delete => replace with delete
  // existing.delete + new.create => replace with create (re-create)
  // others => append

  if (existing.op === 'create') {
    if (op === 'update') {
      existing.payload = { ...existing.payload, ...payload, clientUpdatedAt: now };
      existing.updatedAt = now;
      existing.status = 'pending';
      writeQueue(q);
      return existing.uid;
    }
    if (op === 'delete') {
      // create then delete => remove both (no server op needed)
      q.splice(idx, 1);
      writeQueue(q);
      return null;
    }
    // create + create => merge
    existing.payload = { ...existing.payload, ...payload, clientUpdatedAt: now };
    existing.updatedAt = now;
    writeQueue(q);
    return existing.uid;
  }

  if (existing.op === 'update') {
    if (op === 'update') {
      existing.payload = { ...existing.payload, ...payload, clientUpdatedAt: now };
      existing.updatedAt = now;
      existing.status = 'pending';
      writeQueue(q);
      return existing.uid;
    }
    if (op === 'delete') {
      existing.op = 'delete';
      existing.payload = {
        entity: existing.payload.entity,
        id: payload.id ?? existing.payload.id,
        clientId: payload.clientId ?? existing.payload.clientId,
      } as GenericPayload;
      existing.updatedAt = now;
      existing.status = 'pending';
      writeQueue(q);
      return existing.uid;
    }
    // update + create improbable -> treat as update
    existing.payload = { ...existing.payload, ...payload, clientUpdatedAt: now };
    existing.updatedAt = now;
    writeQueue(q);
    return existing.uid;
  }

  if (existing.op === 'delete') {
    if (op === 'create') {
      // delete then create => convert to create
      const newItem: OutboxItem = {
        uid: uuid(),
        op: 'create',
        createdAt: now,
        attempts: 0,
        status: 'pending',
        lastError: null,
        payload: { ...payload },
        updatedAt: now,
      };
      q.splice(idx, 1, newItem);
      writeQueue(q);
      return newItem.uid;
    }
    // delete + delete -> ignore
    return existing.uid;
  }

  // fallback append
  const item: OutboxItem = {
    uid: uuid(),
    op,
    createdAt: now,
    attempts: 0,
    status: 'pending',
    lastError: null,
    payload: { ...payload },
    updatedAt: now,
  };
  q.push(item);
  writeQueue(q);
  return item.uid;
};
