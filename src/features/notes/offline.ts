// src/features/notes/offline.ts
import { ENTITY_TYPES } from '@api/contants/constants';
import {NoteType} from '@api/types/Task';
import {enqueueCoalesced} from '@offline/outbox';

export type NoteOfflineProps = {
  idJob: number;
  clientId?: string; // required for offline create
} & NoteType;

export async function offlineCreateNote({
  idJob,
  clientId,
  title,
  description,
}: NoteOfflineProps) {
  if (!clientId) throw new Error('offlineCreateNote requires clientId');
  return enqueueCoalesced('create', {
    entity: ENTITY_TYPES.NOTE,
    idJob,
    clientId,
    body: {title, description},
  });
}

export async function offlineUpdateNote({
  idJob,
  id,
  clientId,
  title,
  description,
}: NoteOfflineProps) {
  if (!id && !clientId)
    throw new Error('offlineUpdateNote requires id or clientId');
  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.NOTE,
    idJob,
    id,
    clientId,
    body: {
      ...(title !== undefined ? {title} : {}),
      ...(description !== undefined ? {description} : {}),
    },
  });
}

export async function offlineDeleteNote({
  idJob,
  id,
  clientId,
}: NoteOfflineProps) {
  if (!id && !clientId)
    throw new Error('offlineDeleteNote requires id or clientId');
  return enqueueCoalesced('delete', {
    entity: ENTITY_TYPES.NOTE,
    idJob,
    id,
    clientId,
  });
}
