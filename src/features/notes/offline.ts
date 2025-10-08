// src/features/notes/offline.ts
import { enqueueCoalesced } from '@offline/outbox';

export type NoteOfflineProps = {
  idJob: number;
  id?: number;
  clientId?: string; // required for offline create
  title?: string;
  description?: string;
};

const ENTITY = 'note';

export async function offlineCreateNote({ idJob, clientId, title, description }: NoteOfflineProps) {
  if (!clientId) throw new Error('offlineCreateNote requires clientId');
  return enqueueCoalesced('create', {
    entity: ENTITY,
    idJob,
    clientId,
    body: { title, description },
  });
}

export async function offlineUpdateNote({ idJob, id, clientId, title, description }: NoteOfflineProps) {
  if (!id && !clientId) throw new Error('offlineUpdateNote requires id or clientId');
  return enqueueCoalesced('update', {
    entity: ENTITY,
    idJob,
    id,
    clientId,
    body: { ...(title !== undefined ? { title } : {}), ...(description !== undefined ? { description } : {}) },
  });
}

export async function offlineDeleteNote({ idJob, id, clientId }: NoteOfflineProps) {
  if (!id && !clientId) throw new Error('offlineDeleteNote requires id or clientId');
  return enqueueCoalesced('delete', {
    entity: ENTITY,
    idJob,
    id,
    clientId,
  });
}
