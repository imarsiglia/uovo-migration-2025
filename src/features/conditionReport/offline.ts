// src/features/notes/offline.ts
import {ENTITY_TYPES} from '@api/contants/constants';
import {
  RemovePhotoConditionApiProps,
  SaveConditionReportApiProps,
  SavePhotoConditionApiProps,
  SaveZoomScreenProps,
} from '@api/services/reportServices';
import { CONDITION_TYPES } from '@api/types/Condition';
import {enqueueCoalesced} from '@offline/outbox';
import {OutboxOpKind} from '@offline/types';

export type ConditionReportOfflineProps = {
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
    idJob: rest.idJob,
    clientId,
    body: {...rest},
  });
}

export async function offlineUpdateConditionReport({
  clientId,
  ...rest
}: ConditionReportOfflineProps) {
  if (!rest.id && !clientId)
    throw new Error('offlineUpdateConditionReport requires id or clientId');
  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.CONDITION_REPORT,
    id: rest.id!,
    clientId,
    idJob: rest.idJob,
    body: {
      ...rest,
    },
  });
}

export async function offlineDeleteConditionReport(params: {
  idJob: number;
  id?: number | null;
  clientId?: string;
}) {
  const {idJob, id, clientId} = params;
  if (!id && !clientId) {
    throw new Error('offlineDeleteConditionReport requires id or clientId');
  }
  return enqueueCoalesced('delete', {
    entity: ENTITY_TYPES.CONDITION_REPORT,
    idJob,
    id: id ?? undefined,
    clientId,
  });
}

export type SavePhotoConditionOfflineProps = {
  // offline
  clientId?: string;
  parentClientId?: string;
} & SavePhotoConditionApiProps;

export async function offlineCreateConditionPhoto({
  clientId,
  parentClientId,
  ...rest
}: SavePhotoConditionOfflineProps) {
  const op = rest.id ? 'update' : 'create';

  if (op === 'create' && !clientId) {
    throw new Error('offlineSaveConditionPhoto requires clientId on create');
  }

  // Padre según el conditionType de la foto
  const parentEntity =
    rest.conditionType === CONDITION_TYPES.ConditionCheck
      ? ENTITY_TYPES.CONDITION_CHECK
      : ENTITY_TYPES.CONDITION_REPORT;

  return enqueueCoalesced(op, {
    entity: ENTITY_TYPES.CONDITION_PHOTO,
    idJob: rest.idJob,
    id: rest.id ?? undefined,
    clientId,
    parentClientId,
    parentEntity,
    body: {
      ...rest,
    },
  });
}

export async function offlineUpdateConditionPhoto({
  clientId,
  parentClientId,
  ...rest
}: SavePhotoConditionOfflineProps) {
  const op = 'update';

  if (!clientId) {
    throw new Error('offlineUpdateConditionPhoto requires clientId on update');
  }

  // Padre según el conditionType de la foto
  const parentEntity =
    rest.conditionType === CONDITION_TYPES.ConditionCheck
      ? ENTITY_TYPES.CONDITION_CHECK
      : ENTITY_TYPES.CONDITION_REPORT;

  return enqueueCoalesced(op, {
    entity: ENTITY_TYPES.CONDITION_PHOTO,
    idJob: rest.idJob,
    id: rest.id ?? undefined,
    clientId,
    parentClientId,
    parentEntity,
    body: {
      ...rest,
    },
  });
}

export type RemovePhotoConditionOfflineProps = {
  idJob: number;
  clientId?: string; // si nunca se subió al servidor
} & RemovePhotoConditionApiProps;

export async function offlineDeleteConditionPhoto({
  clientId,
  ...rest
}: RemovePhotoConditionOfflineProps) {
  if (!rest.id && !clientId) {
    throw new Error('offlineDeleteConditionPhoto requires id or clientPhotoId');
  }

  return enqueueCoalesced('delete', {
    entity: rest.isOverview
      ? ENTITY_TYPES.CONDITION_ZOOM_PHOTO
      : ENTITY_TYPES.CONDITION_PHOTO,
    idJob: rest.idJob,
    id: rest.id ?? undefined,
    clientId,
    body: {
      ...rest,
    },
  });
}

export type SaveZoomScreenOfflineProps = {
  clientId?: string;
  id?: number;
  parentClientId?: string;
} & SaveZoomScreenProps;

export async function offlineCreateZoomScreen({
  id,
  clientId,
  parentClientId,
  ...rest
}: SaveZoomScreenOfflineProps) {
  const op = id ? 'update' : 'create';

  if (op === 'create' && !clientId) {
    throw new Error('offlineCreateZoomScreen requires clientId on create');
  }

  return enqueueCoalesced(op, {
    entity: ENTITY_TYPES.CONDITION_ZOOM_PHOTO,
    idJob: rest.idJob,
    clientId,
    body: {...rest},
  });
}

export async function offlineUpdateZoomScreen({
  id,
  clientId,
  parentClientId,
  ...rest
}: SaveZoomScreenOfflineProps) {
  if (!clientId) {
    throw new Error('offlineCreateZoomScreen requires clientId on create');
  }
  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.CONDITION_ZOOM_PHOTO,
    idJob: rest.idJob,
    clientId,
    body: {...rest},
  });
}
