import {ENTITY_TYPES} from '@api/contants/constants';
import {SignatureType} from '@api/types/Task';
import {enqueueCoalesced} from '@offline/outbox';

export type SignatureOfflineProps = {
  idJob: number;
  force_send?: boolean;
  printName?: string;
  type?: string;
  signature?: string; //base64
  id?: number;
  clientId?: string; // required for offline support
};

export async function offlineCreateSignature({
  idJob,
  clientId,
  force_send,
  printName,
  type,
  signature,
}: SignatureOfflineProps) {
  if (!clientId) throw new Error('offlineCreateSignature requires clientId');
  return enqueueCoalesced('create', {
    entity: ENTITY_TYPES.SIGNATURE,
    idJob,
    clientId,
    body: {force_send, printName, type, signature},
  });
}

export async function offlineDeleteSignature({
  idJob,
  id,
  clientId,
}: SignatureOfflineProps) {
  if (!id && !clientId)
    throw new Error('offlineDeleteSignature requires id or clientId');
  return enqueueCoalesced('delete', {
    entity: ENTITY_TYPES.SIGNATURE,
    idJob,
    id,
    clientId,
  });
}
