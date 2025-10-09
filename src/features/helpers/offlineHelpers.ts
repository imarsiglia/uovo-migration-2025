// src/features/helpers/offlineHelpers.ts
import type {OutboxItem} from '@offline/types';
import {QueryClient, QueryKey} from '@tanstack/react-query';

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
    const res = await fetch(url, {method: 'HEAD', signal: ctrl.signal});
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

export type RefKey = {id?: number | string; clientId?: string};
type RemoveOpts<T> = {
  idProp?: keyof T;
  clientIdProp?: keyof T;
};

export function removeFromArrayCache<T extends Record<string, any>>(
  qc: QueryClient,
  key: QueryKey,
  ref: RefKey,
  opts: RemoveOpts<T> = {},
): void {
  const idProp = (opts.idProp ?? 'id') as keyof T;
  const clientIdProp = (opts.clientIdProp ?? 'clientId') as keyof T;

  qc.setQueryData<T[] | undefined>(key, (old) => {
    if (!old || !Array.isArray(old) || old.length === 0) return old;

    return old.filter((item) => {
      if (ref.id != null) {
        return String(item[idProp] as any) !== String(ref.id);
      }
      if (ref.clientId != null) {
        return String(item[clientIdProp] as any) !== String(ref.clientId);
      }
      // si no vino ni id ni clientId, no removemos nada
      return true;
    });
  });
}

export type UpsertOpts<T> = {
  /** Propiedad para id real (default: 'id') */
  idKey?: keyof T;
  /** Propiedad para id de cliente (default: 'clientId') */
  clientIdKey?: keyof T;
  /** Propiedad para timestamp (default: 'update_time') */
  updateTimeKey?: keyof T;
  /** Propiedades de flags (defaults: '_pending', '_deleted') */
  pendingKey?: keyof T;
  deletedKey?: keyof T;
  /** Dónde insertar si es nuevo (default: 'start') */
  position?: 'start' | 'end';
  /**
   * Cómo fusionar el item existente con el incoming.
   * Default: {...existing, ...incoming, update_time: now}
   */
  merge?: (
    existing: T,
    incoming: Partial<T> & Record<string, any>,
    nowIso: string,
  ) => T;
  /**
   * Inicializadores por defecto para campos requeridos según tu app.
   * Se aplican si no vienen en `patch`.
   */
  defaults?: Partial<T>;
};
/**
 * Upsert genérico para listas cacheadas (React Query) con soporte offline:
 * - Busca por id o por clientId
 * - Si existe, fusiona
 * - Si no existe, inserta (al inicio por default)
 * - Setea update_time, _pending y _deleted con valores coherentes por defecto
 */
export function upsertIntoArrayCache<T extends Record<string, any>>(
  qc: QueryClient,
  key: QueryKey,
  patch: Partial<T> & Record<string, any>,
  opts: UpsertOpts<T> = {},
): void {
  const idKey = (opts.idKey ?? 'id') as keyof T;
  const clientIdKey = (opts.clientIdKey ?? 'clientId') as keyof T;
  const updateTimeKey = (opts.updateTimeKey ?? 'update_time') as keyof T;
  const pendingKey = (opts.pendingKey ?? '_pending') as keyof T;
  const deletedKey = (opts.deletedKey ?? '_deleted') as keyof T;
  const position = opts.position ?? 'start';

  const nowIso = new Date().toISOString();

  qc.setQueryData<T[] | undefined>(key, (old) => {
    const arr = Array.isArray(old) ? [...old] : [];

    const patchId = patch[idKey];
    const patchClientId = patch[clientIdKey];

    const idx = arr.findIndex((item) => {
      if (patchId != null && item[idKey] != null) {
        return String(item[idKey] as any) === String(patchId as any);
      }
      if (patchClientId != null && item[clientIdKey] != null) {
        return (
          String(item[clientIdKey] as any) === String(patchClientId as any)
        );
      }
      return false;
    });

    const ensureDefaults = (incoming: Partial<T> & Record<string, any>): T => {
      const base: any = {
        ...opts.defaults,
        ...incoming,
      };

      // update_time
      base[updateTimeKey] = nowIso;

      // _pending: true por defecto si no viene
      if (!(pendingKey in base)) base[pendingKey] = true as any;

      // _deleted: false por defecto si no viene
      if (!(deletedKey in base)) base[deletedKey] = false as any;

      return base as T;
    };

    const mergeDefault = (
      existing: T,
      incoming: Partial<T> & Record<string, any>,
      now: string,
    ): T =>
      ({
        ...existing,
        ...incoming,
        [updateTimeKey]: now,
      } as T);

    if (idx >= 0) {
      // existe → merge
      const merged = (opts.merge ?? mergeDefault)(arr[idx], patch, nowIso);
      arr[idx] = merged;
    } else {
      // nuevo → insertar con defaults
      const next = ensureDefaults(patch);
      if (position === 'start') arr.unshift(next);
      else arr.push(next);
    }

    return arr;
  });
}

export type ObjectUpsertOpts<T> = {
  /** Nombre del campo timestamp (default: 'update_time') */
  updateTimeKey?: keyof T;
  /** Campo de pending (default: '_pending') */
  pendingKey?: keyof T;
  /** Campo de deleted (default: '_deleted') */
  deletedKey?: keyof T;
  /** Valores por defecto si no existe el objeto aún */
  defaults?: Partial<T>;
  /**
   * Merge custom entre estado previo y patch entrante.
   * Default: { ...old, ...patch, update_time: now, _pending: patch._pending ?? true }
   */
  merge?: (
    oldVal: T | undefined,
    patch: Partial<T> & Record<string, any>,
    nowIso: string,
  ) => T;
};
/**
 * Upsert optimista de un OBJETO en el cache de React Query.
 * - Si no existe, crea a partir de defaults + patch.
 * - Siempre setea update_time.
 * - _pending = true por defecto salvo que patch lo fuerce.
 */
export function upsertIntoObjectCache<T extends Record<string, any>>(
  qc: QueryClient,
  key: QueryKey,
  patch: Partial<T> & Record<string, any>,
  opts: ObjectUpsertOpts<T> = {},
): void {
  const updateTimeKey = (opts.updateTimeKey ?? 'update_time') as keyof T;
  const pendingKey = (opts.pendingKey ?? '_pending') as keyof T;
  const deletedKey = (opts.deletedKey ?? '_deleted') as keyof T;
  const nowIso = new Date().toISOString();

  const defaultMerge = (
    oldVal: T | undefined,
    incoming: Partial<T> & Record<string, any>,
    now: string,
  ): T => {
    const base: any = {
      ...(opts.defaults ?? {}),
      ...(oldVal ?? {}),
      ...incoming,
    };
    // timestamp
    base[updateTimeKey] = now;
    // _pending default true si no viene en patch
    if (!(pendingKey in incoming)) base[pendingKey] = true as any;
    // si no tienes delete lógico en esta entidad, esto no te afecta
    if (!(deletedKey in base))
      base[deletedKey] = (oldVal?.[deletedKey] ?? false) as any;
    return base as T;
  };

  const mergeFn = opts.merge ?? defaultMerge;

  qc.setQueryData<T | undefined>(key, (old) =>
    mergeFn(old as T | undefined, patch, nowIso),
  );
}
