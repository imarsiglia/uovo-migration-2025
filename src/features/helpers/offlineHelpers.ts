// src/features/offlineHelpers.ts
import 'react-native-get-random-values';
import { enqueueCoalesced } from '@offline/outbox';
import { GenericPayload } from '@offline/types';
import { QueryClient } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';

export const optimisticAddLocal = (qc: QueryClient, queryKey: any, item: any) => {
  const prev = qc.getQueryData<any[]>(queryKey) ?? [];
  qc.setQueryData(queryKey, [item, ...prev]);
};

export const optimisticUpdateLocal = (qc: QueryClient, queryKey: any, matcher: (i:any)=>boolean, patch: any) => {
  const prev = qc.getQueryData<any[]>(queryKey) ?? [];
  qc.setQueryData(queryKey, prev.map(i => matcher(i) ? { ...i, ...patch } : i));
};

export const optimisticRemoveLocal = (qc: QueryClient, queryKey: any, matcher: (i:any)=>boolean) => {
  const prev = qc.getQueryData<any[]>(queryKey) ?? [];
  qc.setQueryData(queryKey, prev.filter(i => !matcher(i)));
};

/**
 * createEntityOffline: create local with clientId and enqueue create
 * - queryKey: [ENTITY_KEY, { idJob }]
 * - body: object to store in body
 */
export function createEntityOffline(qc: QueryClient, params: { entity: string; idJob?: number; body: any; queryKey: any }) {
  const clientId = uuid();
  const clientCreatedAt = Date.now();
  const local = { ...params.body, clientId, clientCreatedAt, pending: true };
  optimisticAddLocal(qc, params.queryKey, local);
  const payload: GenericPayload = {
    entity: params.entity,
    idJob: params.idJob,
    clientId,
    body: params.body,
    clientCreatedAt,
  };
  enqueueCoalesced('create', payload);
  return clientId;
}

export function updateEntityOffline(qc: QueryClient, params: { entity: string; idJob?: number; id?: number; clientId?: string; body: any; queryKey: any }) {
  const { entity, idJob, id, clientId, body, queryKey } = params;
  optimisticUpdateLocal(qc, queryKey, (i)=> (id ? i.id === id : (clientId ? i.clientId === clientId : false)), { ...body, pending: true });
  const payload: GenericPayload = { entity, idJob, id, clientId, body, clientUpdatedAt: Date.now() } as any;
  enqueueCoalesced('update', payload);
}

export function deleteEntityOffline(qc: QueryClient, params: { entity: string; idJob?: number; id?: number; clientId?: string; queryKey: any }) {
  const { entity, idJob, id, clientId, queryKey } = params;
  optimisticRemoveLocal(qc, queryKey, (i) => (id ? i.id === id : (clientId ? i.clientId === clientId : false)));
  const payload = { entity, idJob, id, clientId } as any;
  enqueueCoalesced('delete', payload);
}
