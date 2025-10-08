// src/offline/outbox.ts
import 'react-native-get-random-values';
import { MMKV } from 'react-native-mmkv';
import { v4 as uuid } from 'uuid';
import type { OutboxItem, GenericPayload, OutboxOpKind, OutboxStatus, ProcessingSession } from './types';

const STORE_ID = 'offline-outbox-v5';
const KEY_QUEUE = 'OUTBOX_QUEUE_V5';
const KEY_LOCK  = 'OUTBOX_LOCK_V5';
const KEY_SESSION = 'OUTBOX_SESSION_V5';
const KEY_FAILED_ARCHIVE = 'OUTBOX_FAILED_ARCHIVE_V3';

export const LOCK_STALE_MS = 2 * 60 * 1000;      // stale lock takeover window
export const STUCK_THRESHOLD_MS = 3 * 60 * 1000; // requeue in_progress older than this

const store = new MMKV({ id: STORE_ID });

/** ------------ storage helpers (sync, wrapped as async) ------------ */
const r = async (k: string) => store.getString(k) ?? null;
const w = async (k: string, v: string) => store.set(k, v);
const d = async (k: string) => store.delete(k);

/** ------------ queue helpers ------------ */
export async function readQueue(): Promise<OutboxItem[]> {
  const raw = await r(KEY_QUEUE);

  if (!raw) return [];
  try { return JSON.parse(raw) as OutboxItem[]; } catch { return []; }
}
export async function writeQueue(q: OutboxItem[]) { await w(KEY_QUEUE, JSON.stringify(q)); }
export async function replaceQueue(q: OutboxItem[]) { await writeQueue(q); }
export async function clearQueue() { await d(KEY_QUEUE); }

export async function getQueueCounts(): Promise<{ pending: number; in_progress: number; succeeded: number; failed: number; total: number; }> {
  const q = await readQueue();
  const c = { pending: 0, in_progress: 0, succeeded: 0, failed: 0 };
  for (const it of q) (c as any)[it.status] += 1;
  return { ...c, total: q.length };
}
export async function getQueueByStatus(): Promise<Record<OutboxStatus, OutboxItem[]>> {
  const q = await readQueue();
  return {
    pending: q.filter(i => i.status === 'pending'),
    in_progress: q.filter(i => i.status === 'in_progress'),
    succeeded: q.filter(i => i.status === 'succeeded'),
    failed: q.filter(i => i.status === 'failed'),
  };
}

/** ------------ failed archive ------------ */
export type FailedArchiveItem = OutboxItem & { archivedAt: number };

export async function readFailedArchive(): Promise<FailedArchiveItem[]> {
  const raw = await r(KEY_FAILED_ARCHIVE);
  if (!raw) return [];
  try { return JSON.parse(raw) as FailedArchiveItem[]; } catch { return []; }
}
export async function writeFailedArchive(items: FailedArchiveItem[]) {
  await w(KEY_FAILED_ARCHIVE, JSON.stringify(items));
}
/** Moves all failed from the outbox to the archive and clears them from queue. */
export async function archiveAndClearFailed(): Promise<number> {
  const q = await readQueue();
  const failed = q.filter(i => i.status === 'failed');
  if (!failed.length) return 0;
  const remaining = q.filter(i => i.status !== 'failed');
  const old = await readFailedArchive();
  const now = Date.now();
  const merged = [...old, ...failed.map(i => ({ ...i, archivedAt: now }))];
  await writeQueue(remaining);
  await writeFailedArchive(merged);
  return failed.length;
}

/** ------------ processing session ------------ */
export async function readProcessingSession(): Promise<ProcessingSession | null> {
  const raw = await r(KEY_SESSION);
  if (!raw) return null;
  try { return JSON.parse(raw) as ProcessingSession; } catch { return null; }
}
export async function writeProcessingSession(s: ProcessingSession) {
  await w(KEY_SESSION, JSON.stringify(s));
}
export async function clearProcessingSession() { await d(KEY_SESSION); }

/** ------------ lock with session takeover ------------ */
export async function tryAcquireProcessingLock(sessionId: string): Promise<boolean> {
  const raw = await r(KEY_LOCK);
  const now = Date.now();
  if (!raw) {
    await w(KEY_LOCK, JSON.stringify({ sessionId, ts: now }));
    return true;
  }
  try {
    const lock = JSON.parse(raw) as { sessionId: string; ts: number };
    if (now - lock.ts > LOCK_STALE_MS) {
      await w(KEY_LOCK, JSON.stringify({ sessionId, ts: now })); // takeover
      return true;
    }
    return lock.sessionId === sessionId;
  } catch {
    await w(KEY_LOCK, JSON.stringify({ sessionId, ts: now }));
    return true;
  }
}
export async function refreshProcessingLock(sessionId: string) {
  const raw = await r(KEY_LOCK);
  if (!raw) return;
  try {
    const lock = JSON.parse(raw) as { sessionId: string; ts: number };
    if (lock.sessionId === sessionId) {
      lock.ts = Date.now();
      await w(KEY_LOCK, JSON.stringify(lock));
    }
  } catch {}
}
export async function releaseProcessingLock(sessionId: string) {
  const raw = await r(KEY_LOCK);
  if (!raw) return;
  try {
    const lock = JSON.parse(raw) as { sessionId: string; ts: number };
    if (lock.sessionId === sessionId) await d(KEY_LOCK);
  } catch { await d(KEY_LOCK); }
}

/** ------------ enqueue with coalescing ------------ */
function sameRecord(a: GenericPayload, b: GenericPayload): boolean {
  if (a.entity !== b.entity) return false;
  if (a.clientId && b.clientId) return a.clientId === b.clientId;
  if (a.id && b.id) return a.id === b.id;
  return false;
}

export async function enqueueCoalesced(op: OutboxOpKind, payload: GenericPayload): Promise<string> {
  const q = await readQueue();
  const matches = q.map((it, i) => ({ it, i })).filter(({ it }) => sameRecord(it.payload, payload));

  if (op === 'update') {
    for (const { it, i } of matches) {
      if (it.op === 'create' || it.op === 'update') {
        const merged: GenericPayload = {
          ...it.payload,
          ...payload,
          body: { ...(it.payload.body ?? {}), ...(payload.body ?? {}) },
          clientUpdatedAt: Date.now(),
        };
        q[i] = { ...it, payload: merged, updatedAt: Date.now() };
        await writeQueue(q);
        return it.uid;
      }
    }
  }
  if (op === 'delete') {
    let removed = false;
    for (let k = q.length - 1; k >= 0; k--) {
      const it = q[k];
      if (sameRecord(it.payload, payload) && (it.op === 'create' || it.op === 'update')) {
        q.splice(k, 1);
        removed = true;
      }
    }
    if (removed && !payload.id && payload.clientId) {
      await writeQueue(q);
      return uuid(); // net-zero (create+delete collapsed)
    }
  }

  const now = Date.now();
  const item: OutboxItem = {
    uid: uuid(),
    op,
    payload: { ...payload, clientUpdatedAt: now, clientCreatedAt: payload.clientCreatedAt ?? now },
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    status: 'pending',
    lastError: null,
  };
  q.push(item);
  await writeQueue(q);
  return item.uid;
}
