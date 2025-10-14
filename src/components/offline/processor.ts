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
import type {ProcessingSession} from '@offline/types';

import {pingApiHead} from '@features/helpers/offlineHelpers';
import {taskServices} from '@api/services/taskServices';
import {coalesceMaterialsPlanFromQueue} from '@features/materials/offline';
import {ENTITY_TYPES, QUERY_KEYS} from '@api/contants/constants';
import {runItemThroughEntityServices} from '@api/services/entityServices';

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
      // Marcamos el item como in_progress, ejecutamos lo que toque y luego succeeded/failed.
      q = await readQueue();

      console.log('queue to process');
      console.log(q);
      const idx = q.findIndex((it: any) => it.uid === next.uid);
      if (idx < 0) continue;

      const it = q[idx];
      // in_progress
      q[idx] = {...it, status: 'in_progress', updatedAt: Date.now()};
      await replaceQueue(q);

      try {
        // Aquí despacha tus otros servicios según payload.entity/op si aplica.
        await runItemThroughEntityServices(qc, it);

        // En esta base, lo marcamos como éxito directo.
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

// -------------------------------------------------
// API pública (manteniendo compatibilidad de nombres)
// -------------------------------------------------

/**
 * ✅ Modo ESTRICTO (con lock). Útil para workers en background.
 * Si no consigue lock, sale sin hacer nada (para evitar colisiones).
 */
export async function processOnce(qc: QueryClient, opts: ProcessOnceOpts = {}) {
  await processCore(qc, opts, {useLock: true});
}

/**
 * ✅ Modo FORZADO (sin lock + ping ignorado): pensado para tu UI.
 * - Garantiza que “arranca” aunque NetInfo/ping/lock molesten.
 * - Reencola “in_progress” atascados antes de procesar.
 * - Mantiene tu contrato público (tu UI ya importa este nombre).
 */
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
