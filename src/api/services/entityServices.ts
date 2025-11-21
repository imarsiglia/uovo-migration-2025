// src/api/services/entityServices.ts
// Generic adapter: maps entity -> concrete API calls.
// Implements "note" using your taskServices, and is ready to extend.

import {QueryClient} from '@tanstack/react-query';
import {ENTITY_TYPES, QUERY_KEYS} from '@api/contants/constants';
import {
  SaveBOLCountApiProps,
  SaveImageApiProps,
  taskServices,
  UpdateImageApiProps,
} from './taskServices';
import type {OutboxItem} from '@offline/types';
import {readQueue, replaceQueue} from '@offline/outbox';
import {
  inventoryServices,
  UpdateInventoryDetailApiProps,
} from './inventoryServices';
import {
  PhotoConditionOverviewApiProps,
  RemovePhotoConditionApiProps,
  reportServices,
  SaveConditionCheckApiProps,
  SaveConditionReportApiProps,
  SavePhotoConditionApiProps,
  SaveZoomScreenProps,
} from './reportServices';

type CreateFn = (payload: any) => Promise<any>;
type UpdateFn = (payload: any) => Promise<any>;
type DeleteFn = (payload: any) => Promise<any>;
type ListFn = (opts: any) => Promise<any[]>;

type Service = {
  create?: CreateFn;
  update?: UpdateFn;
  delete?: DeleteFn;
  list?: ListFn;
};

const REGISTRY: Record<string, Service> = {
  /** NOTES */
  note: {
    list: async ({idJob}: {idJob: number}) => taskServices.getNotes({idJob}),
    // In your backend saveNote creates/updates depending on props.id
    create: async ({idJob, body}: any) =>
      taskServices.saveNote({idJob, ...body, id: null}),
    update: async ({id, idJob, body}: any) =>
      taskServices.saveNote({idJob, ...body, id}),
    delete: async ({id}: any) => taskServices.deleteNote({id}),
  },

  /** MATERIALS: crear 1 individual */
  report_material: {
    // create individual (usa tu hook/servicio registerOne)
    create: async ({
      idJob,
      body,
    }: {
      idJob: number;
      body: {idMaterial: number; quantity: number; idUser: number};
    }) => {
      return taskServices.registerOneReportMaterial({idJob, ...body});
    },
    // opcionalmente podrías exponer list si lo necesitas:
    list: async ({idJob}: {idJob: number}) =>
      taskServices.getReportMaterials({idJob}),
  },

  /** MATERIALS: actualizar/eliminar por LISTA completa */
  report_materials: {
    // en tu backend, delete == enviar la lista filtrada
    update: async ({idJob, body}: {idJob: number; body: {list: any[]}}) => {
      // body.list ya debe venir transformada a { idMaterial, quantity, idUser }
      return taskServices.registerReportMaterials({idJob, list: body.list});
    },
    list: async ({idJob}: {idJob: number}) =>
      taskServices.getReportMaterials({idJob}),
  },

  /** SIGNATURES */
  signature: {
    list: async ({idJob}: {idJob: number}) =>
      taskServices.getSignatures({idJob}),
    create: async ({idJob, body}: any) =>
      taskServices.saveSignature({idJob, ...body, id: null}),
    delete: async ({id}: any) => taskServices.deleteSignature({id}),
  },
  bol_count: {
    update: async ({
      idJob,
      body,
    }: {
      idJob: number;
      body: SaveBOLCountApiProps;
    }) => taskServices.saveBOLCount({...body, idJob}),
    delete: async ({id}: any) => taskServices.deleteSignature({id}),
  },
  item_inventory_detail: {
    update: async ({body}: {body: UpdateInventoryDetailApiProps}) =>
      inventoryServices.updateInventoryItemDetail({...body}),
    delete: async ({id}: {id: number}) => inventoryServices.deleteItem({id}),
  },

  // task pictures
  image: {
    list: async ({idJob}: {idJob: number}) => taskServices.getImages({idJob}),
    create: async ({body}: {body: SaveImageApiProps}) =>
      taskServices.registerImage(body),
    update: async ({body}: {body: UpdateImageApiProps}) =>
      taskServices.updateImage({...body}),
    delete: async ({id}: {id: number}) => taskServices.deleteImage({id}),
  },

  // condition report & condition check
  condition_report: {
    create: async ({body}: {body: SaveConditionReportApiProps}) =>
      reportServices.saveConditionReport({...body, id: null}),
    update: async ({body}: {body: SaveConditionReportApiProps}) =>
      reportServices.saveConditionReport({...body}),
  },
  condition_check: {
    create: async ({body}: {body: SaveConditionCheckApiProps}) =>
      reportServices.saveConditionCheck({...body, id: null}),
    update: async ({body}: {body: SaveConditionCheckApiProps}) =>
      reportServices.saveConditionCheck({...body}),
  },
  condition_photo: {
    create: async ({body}: {body: SavePhotoConditionApiProps}) =>
      reportServices.savePhotoCondition({...body, id: null}),
    update: async ({body}: {body: SavePhotoConditionApiProps}) =>
      reportServices.savePhotoCondition({...body}),
    delete: async ({body}: {body: RemovePhotoConditionApiProps}) =>
      reportServices.removePhotoCondition(body),
  },
  condition_zoom_photo: {
    create: async ({body}: {body: SaveZoomScreenProps}) =>
      reportServices.saveZoomScreen({...body}),
    update: async ({body}: {body: SaveZoomScreenProps}) =>
      reportServices.saveZoomScreen({...body}),
    delete: async ({body}: {body: RemovePhotoConditionApiProps}) =>
      reportServices.removePhotoCondition(body),
  },
};

export function getEntityQueryKey(
  entity: string,
  params?: {idJob?: number; id?: number},
) {
  if (entity === ENTITY_TYPES.NOTE)
    return [QUERY_KEYS.NOTES, {idJob: params?.idJob}];
  // ambas entidades de materials invalidan la misma lista
  if (
    entity === ENTITY_TYPES.REPORT_MATERIAL ||
    entity === ENTITY_TYPES.REPORT_MATERIALS
  ) {
    return [QUERY_KEYS.REPORT_MATERIALS, {idJob: params?.idJob}];
  }
  if (entity === ENTITY_TYPES.SIGNATURE)
    return [
      [QUERY_KEYS.SIGNATURES, {idJob: params?.idJob, forceSend: false}],
      [QUERY_KEYS.SIGNATURES, {idJob: params?.idJob, forceSend: true}],
    ];
  if (entity === ENTITY_TYPES.BOL_COUNT)
    return [[QUERY_KEYS.BOL_COUNT, {idJob: params?.idJob}]];
  if (entity === ENTITY_TYPES.ITEM_INVENTORY_DETAIL)
    return [[QUERY_KEYS.INVENTORY_ITEM_DETAIL, {id: params?.id}]];

  if (entity === ENTITY_TYPES.IMAGE)
    return [[QUERY_KEYS.IMAGES, {idJob: params?.idJob}]];

  if (entity === ENTITY_TYPES.CONDITION_REPORT)
    return [QUERY_KEYS.CONDITION_REPORT_BY_INVENTORY];

  if (entity === ENTITY_TYPES.CONDITION_CHECK)
    return [QUERY_KEYS.CONDITION_CHECK_BY_INVENTORY];

  if (entity === ENTITY_TYPES.CONDITION_PHOTO)
    return [QUERY_KEYS.PHOTOS_CONDITION];

  if (entity === ENTITY_TYPES.CONDITION_ZOOM_PHOTO)
    return [QUERY_KEYS.PHOTO_CONDITION_OVERVIEW];

  return [entity, params ?? {}];
}

export async function runItemThroughEntityServices(
  qc: QueryClient,
  item: OutboxItem,
): Promise<any> {
  const {op, payload} = item;
  const {entity} = payload;
  const svc = REGISTRY[entity];
  if (!svc) throw new Error(`No service registered for entity "${entity}"`);

  if (op === 'create') {
    if (!svc.create) throw new Error(`Create not implemented for "${entity}"`);
    const result = await svc.create(payload);
    try {
      await qc.invalidateQueries({
        queryKey: getEntityQueryKey(entity, {idJob: payload.idJob}),
      });
    } catch {}
    return result;
  }
  if (op === 'update') {
    if (!svc.update) throw new Error(`Update not implemented for "${entity}"`);
    const result = await svc.update(payload);
    try {
      await qc.invalidateQueries({
        queryKey: getEntityQueryKey(entity, {idJob: payload.idJob}),
      });
    } catch {}
    return result;
  }
  if (op === 'delete') {
    if (!svc.delete) throw new Error(`Delete not implemented for "${entity}"`);
    const result = await svc.delete(payload);
    try {
      await qc.invalidateQueries({
        queryKey: getEntityQueryKey(entity, {idJob: payload.idJob}),
      });
    } catch {}
    return result;
  }
  throw new Error(`Unsupported op "${op}"`);
}

/** When a create resolves, remap clientId -> id in queued items for the same entity. */
export async function reconcileClientIdInQueue(
  entity: string,
  clientId: string,
  newId: number,
) {
  let q = await readQueue();
  q = q.map((x) => {
    if (x.payload.entity !== entity) return x;
    const p = x.payload;
    if (p.clientId && p.clientId === clientId) {
      const np: any = {...p};
      delete np.clientId;
      np.id = newId;
      return {...x, payload: np};
    }
    return x;
  });
  await replaceQueue(q);
}
