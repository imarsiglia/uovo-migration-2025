import {QUERY_KEYS} from '@api/contants/constants';
import {inventoryServices} from '@api/services/inventoryServices';
import {reportServices} from '@api/services/reportServices';
import {taskServices} from '@api/services/taskServices';
import {JobInventoryType, ReportResumeType} from '@api/types/Inventory';
import NetInfo from '@react-native-community/netinfo';
import useTopSheetStore from '@store/topsheet';
import {QueryKey, useQuery, useQueryClient} from '@tanstack/react-query';
import {promisePool} from '@utils/functions';
import {useEffect, useMemo} from 'react';

import {Paginated} from '@api/types/Response';
import {seedDetailsFromList, useWarmItemDetails} from './useWarmItemDetails';
import {DAYS_IN_MS} from './HooksTaskServices';
import {TaskImageType} from '@api/types/Task';
import {useWarmFullPhotos} from './useWarmFullPhotos';
import useInventoryStore from '@store/inventory';

const ttl = {
  NOTES: 3 * DAYS_IN_MS,
  IMAGES: 3 * DAYS_IN_MS,
  FULL_IMAGES: 3 * DAYS_IN_MS,
  REPORT_MATERIALS: 3 * DAYS_IN_MS,
  BOL_COUNT: 3 * DAYS_IN_MS,
  SIGNATURES: 3 * DAYS_IN_MS,
  CONDITION_RESUMES: 3 * DAYS_IN_MS,
  INVENTORY_ALL: 3 * DAYS_IN_MS,
  JOB_INVENTORY: 3 * DAYS_IN_MS,
  ALL_REPORT_MATERIALS_INVENTORY: 7 * DAYS_IN_MS,
};

export const useGetJobData = (idJob?: number) => {
  const qc = useQueryClient();
  const signatureForce = useTopSheetStore((d) => d.signatureForce);

  const {orderFilter, orderType, topSheetFilter} = useInventoryStore();

  const jobs = useMemo(() => {
    if (!idJob) {
      return [];
    }
    return [
      {
        key: [QUERY_KEYS.NOTES, {idJob}],
        fn: () => taskServices.getNotes({idJob}),
        ttlMS: ttl.NOTES,
      },
      {
        key: [QUERY_KEYS.IMAGES, {idJob}],
        fn: () => taskServices.getImages({idJob}),
        ttlMS: ttl.IMAGES,
      },
      {
        key: [QUERY_KEYS.SIGNATURES, {idJob, forceSend: signatureForce}],
        fn: () =>
          taskServices.getSignatures({idJob, forceSend: signatureForce}),
        ttlMS: ttl.SIGNATURES,
      },
      {
        key: [QUERY_KEYS.REPORT_MATERIALS, {idJob}],
        fn: () => taskServices.getReportMaterials({idJob}),
        ttlMS: ttl.REPORT_MATERIALS,
      },
      {
        key: [QUERY_KEYS.ALL_REPORT_MATERIALS_INVENTORY, {idJob}],
        fn: () => taskServices.getReportMaterialsInventoryAll({idJob}),
        ttlMS: ttl.ALL_REPORT_MATERIALS_INVENTORY,
      },
      {
        key: [QUERY_KEYS.BOL_COUNT, {idJob}],
        fn: () => taskServices.getBOLCount({idJob}),
        ttlMS: ttl.BOL_COUNT,
      },
      {
        key: [
          QUERY_KEYS.JOB_INVENTORY,
          {idJob, filter: topSheetFilter, orderFilter, orderType},
        ],
        fn: () =>
          inventoryServices.getJobInventory({
            idJob,
            filter: topSheetFilter,
            orderFilter,
            orderType,
          }),
        ttlMS: ttl.JOB_INVENTORY,
      },
      {
        key: [QUERY_KEYS.RESUME_CONDITION_REPORT, {idJob}],
        fn: () => reportServices.getResumeConditionReport({idJob}),
        ttlMS: ttl.CONDITION_RESUMES,
      },
      {
        key: [QUERY_KEYS.RESUME_CONDITION_CHECK, {idJob}],
        fn: () => reportServices.getResumeConditionCheck({idJob}),
        ttlMS: ttl.CONDITION_RESUMES,
      },
    ];
  }, [idJob, signatureForce]);

  useBatchPrefetch(jobs, 4);

  // Lee la lista de inventario DESDE EL CACHE (sin fetch)
  const _inventoryList = useCachedQueryData<JobInventoryType[]>(
    [
      QUERY_KEYS.JOB_INVENTORY,
      {idJob, filter: topSheetFilter, orderFilter, orderType},
    ],
    () =>
      inventoryServices.getJobInventory({
        idJob: idJob!,
        filter: topSheetFilter,
        orderFilter,
        orderType,
      }),
  );

  const _conditionReportList = useCachedQueryData<
    Paginated<ReportResumeType[]>
  >([QUERY_KEYS.RESUME_CONDITION_REPORT, {idJob}], () =>
    reportServices.getResumeConditionReport({idJob: idJob!}),
  );

  const _conditionCheckList = useCachedQueryData<Paginated<ReportResumeType[]>>(
    [QUERY_KEYS.RESUME_CONDITION_CHECK, {idJob}],
    () => reportServices.getResumeConditionCheck({idJob: idJob!}),
  );

  // 1) Primero calienta CONDITION REPORT details
  const reportsWarm = useWarmItemDetails({
    list: _conditionReportList?.data, // Paginated<ReportResumeType[]> → .data
    getId: (it: ReportResumeType) => it.id_job_inventory,
    makeKey: (id) => [
      QUERY_KEYS.CONDITION_REPORT_BY_INVENTORY,
      {idJobInventory: id},
    ],
    fetcher: (id) =>
      // @ts-ignore
      reportServices.getConditionReportbyInventory({idJobInventory: id}),
    concurrency: 4,
    ttlMs: ttl.CONDITION_RESUMES,
    enabled: true, // siempre corre primero
  });

  // 2) Luego, SOLO cuando termine la fase 1, calienta CONDITION CHECK details
  const checksWarm = useWarmItemDetails({
    list: _conditionCheckList?.data,
    getId: (it: ReportResumeType) => it.id_job_inventory,
    makeKey: (id) => [
      QUERY_KEYS.CONDITION_CHECK_BY_INVENTORY,
      {idJobInventory: id},
    ],
    fetcher: (id) =>
      // @ts-ignore
      reportServices.getConditionCheckbyInventory({idJobInventory: id}),
    concurrency: 4,
    ttlMs: ttl.CONDITION_RESUMES,
    enabled: reportsWarm.done, // ← encadenado
  });

  const _imagesList = useCachedQueryData<TaskImageType[]>(
    [QUERY_KEYS.IMAGES, {idJob}],
    () => taskServices.getImages({idJob: idJob!}),
  );

  // Prefetch full-res con versión
  useWarmFullPhotos({
    groups: _imagesList,
    enabled: !!_imagesList?.length && checksWarm.done,
    concurrency: 4,
    ttlMs: ttl.FULL_IMAGES,
    maxPrefetch: 100,
  });

  useEffect(() => {
    if (!_inventoryList || _inventoryList.length == 0) return;
    seedDetailsFromList<JobInventoryType>(
      qc,
      _inventoryList,
      (row) => row.id,
      (id) => [QUERY_KEYS.INVENTORY_ITEM_DETAIL, {id}],
    );
  }, [_inventoryList, qc]);
  return undefined;
};

export type PrefetchJob = {
  key: QueryKey;
  fn: (ctx?: {signal?: AbortSignal}) => Promise<any>; // acepta signal
  force?: boolean;
  /** tiempo en ms para considerar “fresco” y NO refetchear (ej. 7 días) */
  ttlMs?: number;
  /** override de retry para este job */
  retry?: number | boolean;
  retryDelayMs?: number;
};

export function useBatchPrefetch(jobs: PrefetchJob[], concurrency = 4) {
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    if (!jobs?.length) return;

    const abort = new AbortController();

    (async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) return;

      const tasks = jobs
        .filter((j) => {
          if (j.force) return true;
          const state = qc.getQueryState(j.key);
          if (!state?.data) return true;
          // if (!j.ttlMs) return false; // hay data, sin TTL => no refetch
          const age = Date.now() - (state.dataUpdatedAt ?? 0);
          return age > (j.ttlMs ?? 0);
        })
        .map((j) => async () => {
          if (cancelled) return;
          try {
            await qc.prefetchQuery({
              queryKey: j.key,
              // pasa signal al servicio
              queryFn: ({signal}) => j.fn({signal}),
              staleTime: j.ttlMs ?? 0,
              retry: j.retry ?? 1,
              retryDelay: j.retryDelayMs ?? 500,
            });
          } catch {
            // silenciar errores de prefetch
          }
        });

      await promisePool(tasks, concurrency);
    })();

    return () => {
      cancelled = true;
      abort.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(jobs), concurrency]);
}

export function useCachedQueryData<T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
) {
  // No ejecuta la queryFn, solo observa el cache
  const {data} = useQuery<T>({
    queryKey: key,
    enabled: false, // <- clave: no fetch
    queryFn,
  });
  return data;
}
