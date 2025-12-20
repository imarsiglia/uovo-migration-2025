// src/offline/processor.ts
import 'react-native-get-random-values';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient} from '@tanstack/react-query';
import {v4 as uuid} from 'uuid';

import {
  readQueue,
  replaceQueue,
  tryAcquireProcessingLock,
  refreshProcessingLock,
  releaseProcessingLock,
  writeProcessingSession,
  STUCK_THRESHOLD_MS,
} from '@offline/outbox';
import type {OutboxItem, ProcessingSession} from '@offline/types';

import {pingApiHead} from '@features/helpers/offlineHelpers';
import {taskServices} from '@api/services/taskServices';
import {coalesceMaterialsPlanFromQueue} from '@features/materials/offline';
import {ENTITY_TYPES, QUERY_KEYS} from '@api/contants/constants';
import {runItemThroughEntityServices} from '@api/services/entityServices';
import {getServerId, registerServerId} from '@offline/idMap';
import {reportServices} from '@api/services/reportServices';
import {CONDITION_TYPES} from '@api/types/Condition';

type ProcessOnceOpts = {
  processFailedItems?: boolean;
  pingBefore?: () => Promise<boolean>; // si no viene, usa pingApiHead
};

const pickable = (it: any) => it.status === 'pending';

// -------------------------
// Utilidades de “arranque”
// -------------------------

async function softIsOnline(): Promise<boolean> {
  try {
    const net = await NetInfo.fetch();
    // Si RN no sabe, asumimos online para no bloquear arranque
    return net?.isConnected ?? true;
  } catch {
    return true;
  }
}

async function softPing(pingFn?: () => Promise<boolean>): Promise<boolean> {
  try {
    const fn = pingFn ?? pingApiHead;
    const ok = await fn();
    // Si el HEAD no está expuesto en dev, no bloquees
    return typeof ok === 'boolean' ? ok : true;
  } catch {
    return true;
  }
}

/**
 * Reencola cualquier item “in_progress” que esté atascado (stale),
 * útil para recuperar colas bloqueadas por cierres bruscos.
 */
async function recoverStuckInProgress() {
  let q = await readQueue();
  const now = Date.now();
  q = q.map((it: any) =>
    it.status === 'in_progress' &&
    now - (it.updatedAt ?? 0) > STUCK_THRESHOLD_MS
      ? {...it, status: 'pending', updatedAt: Date.now()}
      : it,
  );
  await replaceQueue(q);
}

/**
 * Núcleo de procesamiento.
 * - Si useLock=true, intenta adquirir y mantener lock (modo estricto / background worker).
 * - Si useLock=false, procesa sin lock (modo UI forzado, garantiza arranque).
 */
async function processCore(
  qc: QueryClient,
  opts: ProcessOnceOpts = {},
  {useLock}: {useLock: boolean},
) {
  // 1) No bloquees el arranque por red o ping
  const online = await softIsOnline();
  const pingOk = await softPing(opts.pingBefore);
  // Continuamos igual aunque estén en false, dejarán fallar al llamar servicios.

  // 2) Recuperar “in_progress” atascados ANTES de lock para despejar la cola
  await recoverStuckInProgress();

  // 3) Lock (opcional)
  let sessionId: string | null = null;
  if (useLock) {
    sessionId = uuid();
    const locked = await tryAcquireProcessingLock(sessionId);
    if (!locked) {
      // No consiguió lock → no forzamos, solo salimos silenciosamente en modo estricto
      return;
    }
  }

  const session: ProcessingSession = {
    sessionId: sessionId ?? `nolock-${uuid()}`,
    startedAt: Date.now(),
    total: 0,
    processed: 0,
    currentUid: null,
  };
  await writeProcessingSession(session);

  try {
    // Loop principal
    // NOTA: si no hay lock, igual procesamos (forzar arranque desde UI)
    // en apps single-instance esto es seguro; en multi-instance, prefieran useLock=true.
    while (true) {
      if (useLock && sessionId) {
        await refreshProcessingLock(sessionId);
      }

      let q = await readQueue();
      const next = q.find(pickable);
      if (!next) break;

      // ¿Hay materiales en punta? → procesar en batch
      const firstMat = q.find(
        (i: any) =>
          i.status === 'pending' &&
          (i.payload?.entity === ENTITY_TYPES.REPORT_MATERIAL ||
            i.payload?.entity === ENTITY_TYPES.REPORT_MATERIALS),
      );

      if (firstMat) {
        const idJob = Number(firstMat.payload.idJob ?? 0);
        if (idJob) {
          const plan = await coalesceMaterialsPlanFromQueue(idJob);

          // 1) Lista (sin creates). Enviamos incluso []: tu backend puede usarlo para “vaciar”
          if (plan.finalList) {
            await taskServices.registerReportMaterials({
              idJob,
              list: plan.finalList.map((x) => ({
                id: x.id,
                idMaterial: x.idMaterial,
                quantity: x.quantity,
                idUser: x.idUser,
              })),
            });
          }

          // 2) Creates individuales (respetando idUser)
          for (const cr of plan.creates) {
            await taskServices.registerOneReportMaterial({
              idJob,
              idMaterial: cr.idMaterial,
              quantity: cr.quantity,
              idUser: cr.idUser,
            });
          }

          // 3) Invalida cache
          try {
            await qc.invalidateQueries({
              queryKey: [QUERY_KEYS.REPORT_MATERIALS, {idJob}],
            });
          } catch {}

          // 4) Marcar involucrados como succeeded
          let qMark = await readQueue();
          const done = new Set(plan.involvedUids);
          qMark = qMark.map((it: any) =>
            done.has(it.uid)
              ? {...it, status: 'succeeded', updatedAt: Date.now()}
              : it,
          );
          await replaceQueue(qMark);

          continue; // volver a revisar cola
        }
      }

      // --- procesamiento genérico de otras entidades
      // // Marcamos el item como in_progress, ejecutamos lo que toque y luego succeeded/failed.
      // q = await readQueue();

      // const idx = q.findIndex((it: any) => it.uid === next.uid);
      // if (idx < 0) continue;

      // const it = q[idx];
      // // in_progress
      // q[idx] = {...it, status: 'in_progress', updatedAt: Date.now()};
      // await replaceQueue(q);

      // try {
      //   // Aquí despacha tus otros servicios según payload.entity/op si aplica.
      //   await runItemThroughEntityServices(qc, it);

      //   // En esta base, lo marcamos como éxito directo.
      //   q = await readQueue();
      //   const idx2 = q.findIndex((x: any) => x.uid === it.uid);
      //   if (idx2 >= 0) {
      //     q[idx2] = {...q[idx2], status: 'succeeded', updatedAt: Date.now()};
      //     await replaceQueue(q);
      //   }
      // } catch (e: any) {
      //   q = await readQueue();
      //   const idx2 = q.findIndex((x: any) => x.uid === it.uid);
      //   if (idx2 >= 0) {
      //     const attempts = q[idx2].attempts ?? 0;
      //     q[idx2] = {
      //       ...q[idx2],
      //       status: 'failed',
      //       attempts,
      //       lastError: String(e?.message ?? e),
      //       updatedAt: Date.now(),
      //     };
      //     await replaceQueue(q);
      //   }
      // }

      // --- procesamiento de otras entidades (genérico + casos especiales CR/PHOTO)
      q = await readQueue();

      const idx = q.findIndex((it: any) => it.uid === next.uid);
      if (idx < 0) continue;

      const it = q[idx];

      // Marcar como in_progress
      q[idx] = {...it, status: 'in_progress', updatedAt: Date.now()};
      await replaceQueue(q);

      try {
        let result: 'ok' | 'skip' | void;
        const entity = it.payload?.entity;
        const op = it.op;

        if (entity === ENTITY_TYPES.CONDITION_REPORT) {
          if (op === 'delete') {
            await runItemThroughEntityServices(qc, it);
            result = 'ok';
          } else {
            result = await processConditionReportItem(it);
          }
        } else if (entity === ENTITY_TYPES.CONDITION_CHECK) {
          if (op === 'delete') {
            await runItemThroughEntityServices(qc, it);
            result = 'ok';
          } else {
            // create / update con lógica especial e idMap
            result = await processConditionCheckItem(it);
          }
        } else if (entity === ENTITY_TYPES.CONDITION_PHOTO) {
          if (op === 'delete') {
            await runItemThroughEntityServices(qc, it);
            result = 'ok';
          } else {
            result = await processConditionPhotoItem(it);
          }
        } else {
          // Resto de entidades → flujo genérico
          await runItemThroughEntityServices(qc, it);
          result = 'ok';
        }

        // Si el procesador de fotos nos dice "skip", significa que
        // todavía no existe el padre en el backend.
        if (result === 'skip') {
          q = await readQueue();
          const idx2 = q.findIndex((x: any) => x.uid === it.uid);
          if (idx2 >= 0) {
            const skipped = q[idx2];
            q.splice(idx2, 1); // lo sacamos de su posición actual
            q.push({
              ...skipped,
              status: 'pending',
              updatedAt: Date.now(),
            });
            await replaceQueue(q);
          }
          // En lugar de romper el while, seguimos con el siguiente item
          continue;
        }

        // Éxito normal (ConditionReport / Photo / genérico)
        q = await readQueue();
        const idx2 = q.findIndex((x: any) => x.uid === it.uid);
        if (idx2 >= 0) {
          q[idx2] = {...q[idx2], status: 'succeeded', updatedAt: Date.now()};
          await replaceQueue(q);
        }
      } catch (e: any) {
        q = await readQueue();
        const idx2 = q.findIndex((x: any) => x.uid === it.uid);
        if (idx2 >= 0) {
          const attempts = q[idx2].attempts ?? 0;
          q[idx2] = {
            ...q[idx2],
            status: 'failed',
            attempts,
            lastError: String(e?.message ?? e),
            updatedAt: Date.now(),
          };
          await replaceQueue(q);
        }
      }
    }
  } finally {
    // 5) Libera lock si lo tomaste
    if (useLock && sessionId) {
      await releaseProcessingLock(sessionId);
    }
  }
}

export async function processOnce(qc: QueryClient, opts: ProcessOnceOpts = {}) {
  await processCore(qc, opts, {useLock: true});
}

export async function processQueueOnce(
  qc: QueryClient,
  opts: ProcessOnceOpts = {},
) {
  const forcedOpts: ProcessOnceOpts = {
    ...opts,
    // Ignora ping en modo forzado para no bloquear UI
    pingBefore: async () => true,
  };
  await processCore(qc, forcedOpts, {useLock: false});
}

async function processConditionReportItem(item: OutboxItem): Promise<'ok'> {
  const {payload} = item;
  const {clientId, body} = payload as any;

  // body: SaveConditionReportApiProps
  const reportId = await reportServices.saveConditionReport(body);

  // Si este reporte se creó offline (tiene clientId),
  // guardamos el mapping clientId → reportId real del backend.
  if (clientId && typeof reportId === 'number') {
    registerServerId(ENTITY_TYPES.CONDITION_REPORT, clientId, reportId);
  }

  return 'ok';
}

async function processConditionCheckItem(item: OutboxItem): Promise<'ok'> {
  const {payload} = item;
  const {clientId, body} = payload as any;

  // ⚠️ Ajusta este servicio/nombre de campo según tu API real
  const conditionId = await reportServices.saveConditionCheck(body);

  if (clientId && typeof conditionId === 'number') {
    registerServerId(ENTITY_TYPES.CONDITION_CHECK, clientId, conditionId);
  }

  return 'ok';
}

async function processConditionPhotoItem(
  item: OutboxItem,
): Promise<'ok' | 'skip'> {
  const {payload} = item;
  const {parentClientId, parentEntity, body} = payload as any;

  let {reportId} = body as {reportId?: number};

  // Si no tenemos reportId pero sí parentClientId, intentamos resolverlo
  if (!reportId && parentClientId) {
    // 1) Usar parentEntity que viene del payload (preferido)
    let effectiveParentEntity: string | undefined = parentEntity;

    // 2) Fallback por si hay items viejos en cola (sin parentEntity)
    if (!effectiveParentEntity && body.conditionType) {
      if (body.conditionType === CONDITION_TYPES.ConditionCheck) {
        effectiveParentEntity = ENTITY_TYPES.CONDITION_CHECK;
      } else {
        effectiveParentEntity = ENTITY_TYPES.CONDITION_REPORT;
      }
    }

    // 3) Fallback final: asumir ConditionReport (compatibilidad hacia atrás)
    if (!effectiveParentEntity) {
      effectiveParentEntity = ENTITY_TYPES.CONDITION_REPORT;
    }

    const resolved = getServerId(effectiveParentEntity as any, parentClientId);

    if (!resolved) {
      // El padre aún no se ha sincronizado (REPORT o CHECK)
      return 'skip';
    }

    reportId = resolved;
    body.reportId = resolved;
  }

  // Sin reportId no podemos crear la foto
  if (!reportId) {
    return 'skip';
  }

  // Ya sabemos el id real del padre en el backend
  await reportServices.savePhotoCondition(body);

  return 'ok';
}
