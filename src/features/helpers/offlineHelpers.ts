// src/features/helpers/offlineHelpers.ts
import type { OutboxItem } from '@offline/types';

export function calcBackoffWithJitter(attempts: number): number {
  // 1s, 2s, 4s, 8s ... capped at 60s; ±20% jitter
  const base = Math.min(60_000, 1000 * Math.pow(2, Math.max(0, attempts - 1)));
  const jitter = base * (0.8 + Math.random() * 0.4);
  return Math.floor(jitter);
}

/** Change this to your health endpoint or base API. */
export async function pingApiHead(): Promise<boolean> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=test`;
  if (!url) return true; // do not block if env missing in dev
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

export function labelFromItem(it: OutboxItem) {
  const e = it.payload.entity ?? 'entity';
  const op = it.op.toUpperCase();
  const id = it.payload.id ?? it.payload.clientId ?? it.uid;
  return `[${e}] ${op} ${id}`;
}
