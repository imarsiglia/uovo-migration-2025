// src/features/notes/offline.ts
import {ENTITY_TYPES} from '@api/contants/constants';
import {SaveConditionReportApiProps} from '@api/services/reportServices';
import {enqueueCoalesced} from '@offline/outbox';

export type ConditionReportOfflineProps = {
  idJob: number;
  clientId?: string;
} & SaveConditionReportApiProps;

export async function offlineCreateConditionReport({
  clientId,
  ...rest
}: ConditionReportOfflineProps) {
  if (!clientId)
    throw new Error('offlineCreateConditionReport requires clientId');
  return enqueueCoalesced('create', {
    entity: ENTITY_TYPES.CONDITION_REPORT,
    clientId,
    body: {...rest},
  });
}

export async function offlineUpdateConditionReport({
  id,
  clientId,
  ...rest
}: ConditionReportOfflineProps) {
  if (!id && !clientId)
    throw new Error('offlineUpdateConditionReport requires id or clientId');
  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.CONDITION_REPORT,
    id: id!,
    clientId,
    body: {
      ...rest,
    },
  });
}
