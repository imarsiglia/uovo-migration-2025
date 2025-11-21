// src/features/notes/offline.ts
import {ENTITY_TYPES} from '@api/contants/constants';
import {SaveConditionCheckApiProps} from '@api/services/reportServices';
import {ConditionType} from '@api/types/Condition';
import {enqueueCoalesced} from '@offline/outbox';

export type ConditionCheckOfflineProps = {
  clientId?: string;
} & SaveConditionCheckApiProps;

export async function offlineCreateConditionCheck(
  payload: ConditionCheckOfflineProps,
) {
  const {clientId, ...rest} = payload;
  if (!clientId) {
    throw new Error('offlineCreateConditionCheck requires clientId');
  }

  return enqueueCoalesced('create', {
    entity: ENTITY_TYPES.CONDITION_CHECK,
    idJob: rest.idJob,
    clientId,
    body: {
      ...rest,
    },
  });
}

export async function offlineUpdateConditionCheck(
  payload: ConditionCheckOfflineProps,
) {
  const {id, clientId, ...rest} = payload;

  if (!id && !clientId) {
    throw new Error('offlineUpdateConditionCheck requires id or clientId');
  }

  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.CONDITION_CHECK,
    id: id!,
    clientId,
    idJob: rest.idJob,
    body: {
      ...rest,
    },
  });
}

export async function offlineDeleteConditionCheck(params: {
  idJob: number;
  id?: number | null;
  clientId?: string;
}) {
  const {idJob, id, clientId} = params;
  if (!id && !clientId) {
    throw new Error('offlineDeleteConditionCheck requires id or clientId');
  }

  return enqueueCoalesced('delete', {
    entity: ENTITY_TYPES.CONDITION_CHECK,
    idJob,
    id: id ?? undefined,
    clientId,
  });
}
