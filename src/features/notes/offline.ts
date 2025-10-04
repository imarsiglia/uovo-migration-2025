// src/features/notes/offline.ts
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@api/contants/constants';
import { createEntityOffline, deleteEntityOffline, updateEntityOffline } from '@features/helpers/offlineHelpers';

export function createNoteOffline(qc = useQueryClient(), params: { idJob: number; body: any }) {
  return createEntityOffline(qc, { entity: 'note', idJob: params.idJob, body: params.body, queryKey: [QUERY_KEYS.NOTES, { idJob: params.idJob }] });
}

export function updateNoteOffline(qc = useQueryClient(), params: { idJob: number; id?: number; clientId?: string; body: any }) {
  return updateEntityOffline(qc, { entity: 'note', idJob: params.idJob, id: params.id, clientId: params.clientId, body: params.body, queryKey: [QUERY_KEYS.NOTES, { idJob: params.idJob }] });
}

export function deleteNoteOffline(qc = useQueryClient(), params: { idJob: number; id?: number; clientId?: string }) {
  return deleteEntityOffline(qc, { entity: 'note', idJob: params.idJob, id: params.id, clientId: params.clientId, queryKey: [QUERY_KEYS.NOTES, { idJob: params.idJob }] });
}
