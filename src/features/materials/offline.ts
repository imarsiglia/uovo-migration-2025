// src/features/materials/offline.ts
import {v4 as uuid} from 'uuid';
import type {ReportMaterialType} from '@api/types/Task';
import {enqueueCoalesced, readQueue, replaceQueue} from '@offline/outbox';
import type {GenericPayload, OutboxItem} from '@offline/types';
import {QueryClient} from '@tanstack/react-query';
import {QUERY_KEYS} from '@api/contants/constants';
import {taskServices} from '@api/services/taskServices';

const ENTITY_CREATE = 'report_material';
const ENTITY_LIST = 'report_materials';

export type ListPayloadItem = {
  id?: number;
  idMaterial: number;
  quantity: number;
  idUser: number | null;
};

function pickId(x: any): number | undefined {
  const cands = [
    x?.id,
    x?.idReportMaterial,
    x?.id_report_material,
    x?.reportMaterialId,
    x?.report_material_id,
  ];
  for (const c of cands) {
    const n = Number(c);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return undefined;
}
function pickIdMaterial(x: any): number {
  const cands = [
    x?.idMaterial,
    x?.id_material?.id,
    x?.id_inventory,
    x?.materialId,
    x?.material_id,
  ];
  for (const c of cands) {
    const n = Number(c);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 0;
}
function pickQuantity(x: any): number {
  const n = Number(x?.quantity ?? 0);
  return Number.isNaN(n) ? 0 : n;
}
function pickIdUser(x: any): number | null {
  const cands = [x?.idUser, x?.id_user, x?.user_info?.user_id];
  for (const c of cands) {
    if (c === null || typeof c === 'undefined') return null;
    const n = Number(c);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return null;
}

/** Adaptador de tu modelo a payload de lista (incluye id si existe) */
export function toListPayload(
  list: Array<Partial<ReportMaterialType>>,
): ListPayloadItem[] {
  return (list ?? []).map((x: any) => {
    const id = pickId(x);
    return {
      ...(typeof id === 'number' ? {id} : {}),
      idMaterial: pickIdMaterial(x),
      quantity: pickQuantity(x),
      idUser: pickIdUser(x),
    };
  });
}

/** Crear (offline) un reporte individual de material (permite clientId opcional) */
export async function offlineCreateOneReportMaterial(p: {
  idJob: number;
  idMaterial: number;
  quantity: number;
  idUser: number | null;
  clientId?: string; // <- opcional, tu UI a veces lo pasa
}) {
  const clientId = p.clientId ?? uuid();
  await enqueueCoalesced('create', {
    entity: ENTITY_CREATE,
    idJob: p.idJob,
    clientId,
    body: {
      idMaterial: Number(p.idMaterial ?? 0),
      quantity: Number(p.quantity ?? 0),
      idUser: (p.idUser ?? null) as number | null,
    },
  });
  return clientId;
}

/** Actualiza un create pendiente (si no existe, cae a LISTA con upsert preservando id) */
export async function offlineUpdateOneReportMaterial(p: {
  idJob: number;
  clientId?: string;
  idMaterial?: number;
  idUser?: number | null;
  quantity?: number;
}) {
  const {idJob} = p;
  const q = await readQueue();

  const keyMatch = (body: any) => {
    if (p.clientId) return false;
    if (typeof p.idMaterial !== 'number') return false;
    const idUserWanted = (p.idUser ?? null) as number | null;
    return (
      Number(body?.idMaterial ?? 0) === Number(p.idMaterial) &&
      ((body?.idUser ?? null) as number | null) === idUserWanted
    );
  };

  let updated = false;
  const nextQ: OutboxItem[] = [];

  for (const it of q) {
    const pay = it.payload as GenericPayload;
    if (
      it.status === 'pending' &&
      pay?.entity === ENTITY_CREATE &&
      Number(pay?.idJob ?? 0) === idJob &&
      ((p.clientId && pay?.clientId === p.clientId) ||
        (!p.clientId && keyMatch(pay?.body)))
    ) {
      const body = pay.body ?? {};
      nextQ.push({
        ...it,
        payload: {
          ...pay,
          body: {
            ...body,
            ...(typeof p.quantity === 'number'
              ? {quantity: Number(p.quantity)}
              : {}),
          },
        },
        updatedAt: Date.now(),
      });
      updated = true;
      continue;
    }
    nextQ.push(it);
  }

  if (updated) {
    await replaceQueue(nextQ);
    return {updatedCreate: true, fallbackToList: false};
  }

  // Fallback → actualizar la LISTA pendiente preservando id
  const lastListIdx = [...q]
    .reverse()
    .findIndex(
      (it) =>
        it.status === 'pending' &&
        (it.payload as GenericPayload)?.entity === ENTITY_LIST &&
        Number((it.payload as GenericPayload)?.idJob ?? 0) === idJob,
    );
  if (lastListIdx >= 0) {
    const realIdx = q.length - 1 - lastListIdx;
    const it = q[realIdx];
    const pay = it.payload as GenericPayload;
    const list: ListPayloadItem[] = (pay?.body?.list ?? []).map((x: any) => {
      const id = pickId(x);
      return {
        ...(typeof id === 'number' ? {id} : {}),
        idMaterial: pickIdMaterial(x),
        quantity: pickQuantity(x),
        idUser: pickIdUser(x),
      };
    });

    const idMaterial = Number(p.idMaterial ?? 0);
    const idUser = (p.idUser ?? null) as number | null;
    const idx = list.findIndex(
      (x) =>
        Number(x.idMaterial) === idMaterial &&
        ((x.idUser ?? null) as number | null) === idUser,
    );

    if (idx >= 0 && typeof p.quantity === 'number') {
      list[idx] = {...list[idx], quantity: Number(p.quantity)};
    }

    const q2 = [...q];
    q2[realIdx] = {
      ...it,
      payload: {...pay, body: {...pay.body, list}},
      updatedAt: Date.now(),
    };
    await replaceQueue(q2);
    return {updatedCreate: false, fallbackToList: true};
  }

  if (typeof p.idMaterial === 'number' && typeof p.quantity === 'number') {
    await enqueueCoalesced('update', {
      entity: ENTITY_LIST,
      idJob,
      body: {
        list: [
          {
            idMaterial: Number(p.idMaterial),
            quantity: Number(p.quantity),
            idUser: (p.idUser ?? null) as number | null,
          },
        ],
      },
    });
    return {updatedCreate: false, fallbackToList: true};
  }

  return {updatedCreate: false, fallbackToList: false};
}

/** Actualizar lista completa (update/delete) */
export async function offlineUpdateListOfReportMaterials(p: {
  idJob: number;
  list: Array<Partial<ReportMaterialType>>;
}) {
  await enqueueCoalesced('update', {
    entity: ENTITY_LIST,
    idJob: p.idJob,
    body: {list: toListPayload(p.list)},
  });
}
export const offlineUpsertMaterialsList = offlineUpdateListOfReportMaterials;

export async function offlineDeleteOneOfflineReportMaterial(p: {
  idJob: number;
  clientId: string;
}) {
  const q = await readQueue();
  const remain: OutboxItem[] = [];
  for (const it of q) {
    const pay = it.payload as GenericPayload;
    if (
      pay.entity === ENTITY_CREATE &&
      pay.idJob === p.idJob &&
      pay.clientId === p.clientId
    ) {
      continue; // elimina el create pendiente
    }
    remain.push(it);
  }
  await replaceQueue(remain);
}

export type MaterialsPlan = {
  // creates NO llevan id
  creates: Array<{clientId: string} & Omit<ListPayloadItem, 'id'>>;
  // la lista SÍ puede llevar id
  finalList: ListPayloadItem[] | undefined;
  involvedUids: string[];
};

export async function coalesceMaterialsPlanFromQueue(
  idJob: number,
): Promise<MaterialsPlan> {
  const q = await readQueue();

  const candidates = q.filter(
    (it) =>
      it.status === 'pending' &&
      it.payload?.idJob === idJob &&
      (it.payload?.entity === ENTITY_CREATE ||
        it.payload?.entity === ENTITY_LIST),
  );

  const createsMap = new Map<
    string,
    {clientId: string} & Omit<ListPayloadItem, 'id'>
  >();
  let lastList: ListPayloadItem[] | undefined;

  for (const it of candidates) {
    const p = it.payload as GenericPayload;
    if (p.entity === ENTITY_CREATE) {
      const b = p.body ?? {};
      createsMap.set(String(p.clientId), {
        clientId: String(p.clientId),
        idMaterial: Number(b.idMaterial ?? 0),
        quantity: Number(b.quantity ?? 0),
        idUser: (b.idUser ?? null) as number | null,
      });
    } else if (p.entity === ENTITY_LIST) {
      const raw = (p.body?.list ?? []) as any[];
      lastList = raw.map((x) => {
        const id = pickId(x);
        return {
          ...(typeof id === 'number' ? {id} : {}),
          idMaterial: pickIdMaterial(x),
          quantity: pickQuantity(x),
          idUser: pickIdUser(x),
        };
      });
    }
  }

  if (lastList) {
    const key = (i: {idMaterial: number; idUser: number | null}) =>
      `${i.idMaterial}|${i.idUser ?? 'null'}`;

    // 1) si un ítem de lista coincide con un create → actualiza el create y EXCLUYE ese ítem de la lista final
    const createsByKey = new Map<
      string,
      {clientId: string} & Omit<ListPayloadItem, 'id'>
    >();
    for (const cr of createsMap.values()) createsByKey.set(key(cr), cr);

    const filteredFinal: ListPayloadItem[] = [];
    for (const item of lastList) {
      const k = key(item);
      if (createsByKey.has(k)) {
        const prev = createsByKey.get(k)!;
        createsMap.set(prev.clientId, {
          ...prev,
          quantity: item.quantity,
          idUser: item.idUser,
        });
        // NO agregamos a lista → evita duplicar
        continue;
      }
      filteredFinal.push(item);
    }
    lastList = filteredFinal;

    // ⚠️ IMPORTANTE: NO borro creates que “no están” en la lista,
    // porque tu UI encola LISTA solo con items con id. Ese filtro
    // haría desaparecer creates legítimos.
  }

  return {
    creates: [...createsMap.values()],
    finalList: lastList,
    involvedUids: candidates.map((c) => c.uid),
  };
}

export async function prefetchReportMaterialsInventoryAll(
  idJob: number,
  queryClient: QueryClient,
) {
  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.ALL_REPORT_MATERIALS_INVENTORY, {idJob}],
    queryFn: () => taskServices.getReportMaterialsInventoryAll({idJob}),
  });
}
