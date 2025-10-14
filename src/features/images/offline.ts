import {ENTITY_TYPES} from '@api/contants/constants';
import {enqueueCoalesced} from '@offline/outbox';

export type ImageOfflineProps = {
  id?: number;
  idJob: number;
  title?: string;
  description?: string | null | undefined;
  photos?: string[] | {id: string; photo: string}[];
  clientId?: string; // required for offline create
};

export async function offlineCreateImage({
  idJob,
  clientId,
  ...rest
}: ImageOfflineProps) {
  if (!clientId) throw new Error('offlineCreateImage requires clientId');
  return enqueueCoalesced('create', {
    entity: ENTITY_TYPES.IMAGE,
    idJob,
    clientId,
    body: {...rest, idJob},
  });
}

export async function offlineUpdateImage({
  idJob,
  clientId,
  ...rest
}: ImageOfflineProps) {
  if (!clientId) throw new Error('offlineUpdateImage requires id or clientId');
  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.IMAGE,
    idJob,
    clientId,
    body: {
      idJob,
      ...rest,
    },
  });
}

export async function offlineDeleteImage({
  idJob,
  id,
  clientId,
}: ImageOfflineProps) {
  console.log('offline delete image');
  console.log(id);
  if (!id && !clientId)
    throw new Error('offlineDeleteImage requires id or clientId');
  return enqueueCoalesced('delete', {
    entity: ENTITY_TYPES.IMAGE,
    id,
    idJob,
    clientId,
  });
}
