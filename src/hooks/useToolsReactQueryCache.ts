import {ObjectUpsertOpts, RefKey, removeFromArrayCache, upsertIntoArrayCache, upsertIntoObjectCache, UpsertOpts} from '@features/helpers/offlineHelpers';
import {QueryKey, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

export function useRemoveFromArrayCache<T extends Record<string, any>>(
  key: QueryKey,
  opts?: {idProp?: keyof T; clientIdProp?: keyof T},
) {
  const qc = useQueryClient();
  return useCallback(
    (ref: RefKey) => removeFromArrayCache<T>(qc, key, ref, opts),
    [qc, key, opts?.idProp, opts?.clientIdProp],
  );
}

export function useUpsertArrayCache<T extends Record<string, any>>(
  key: QueryKey,
  opts?: UpsertOpts<T>,
) {
  const qc = useQueryClient();
  return useCallback(
    (patch: Partial<T> & Record<string, any>) => upsertIntoArrayCache<T>(qc, key, patch, opts),
    [qc, key, opts],
  );
}

export function useUpsertObjectCache<T extends Record<string, any>>(
  key: QueryKey,
  opts?: ObjectUpsertOpts<T>,
) {
  const qc = useQueryClient();
  return useCallback(
    (patch: Partial<T> & Record<string, any>) =>
      upsertIntoObjectCache<T>(qc, key, patch, opts),
    [qc, key, opts],
  );
}