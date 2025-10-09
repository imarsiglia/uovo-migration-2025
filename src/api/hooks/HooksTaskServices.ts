import {QUERY_KEYS} from '@api/contants/constants';
import {
  EmployeesApiProps,
  HistoryReportMaterialsApiProps,
  LaborReportsApiProps,
  ReportMaterialsInventoryApiProps,
  SignaturesApiProps,
  TaskBaseApiProps,
  taskServices,
} from '@api/services/taskServices';
import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';

const DAY = 24 * 60 * 60 * 1000;

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: keepPreviousData,
  refetchOnMount: 'always' as const,
};

export const useGetSignatures = ({
  enabled = true,
  ...props
}: SignaturesApiProps & {enabled?: boolean}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNATURES, props],
    queryFn: () => taskServices.getSignatures(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useSaveSignature = () => {
  return useMutation({
    mutationFn: taskServices.saveSignature,
  });
};

export const useDeleteSignature = () => {
  return useMutation({
    mutationFn: taskServices.deleteSignature,
  });
};

export const useGetNotes = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTES, props],
    queryFn: () => taskServices.getNotes(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useSaveNote = () => {
  return useMutation({
    mutationFn: taskServices.saveNote,
  });
};

export const useDeleteNote = () => {
  return useMutation({
    mutationFn: taskServices.deleteNote,
  });
};

export const useGetReportMaterials = ({
  enabled = true,
  ...props
}: TaskBaseApiProps & {enabled?: boolean}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT_MATERIALS, props],
    queryFn: () => taskServices.getReportMaterials(props),
    enabled: !!props?.idJob && enabled,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useRegisterReportMaterials = () => {
  return useMutation({
    mutationFn: taskServices.registerReportMaterials,
  });
};

export const useGetHistoryReportMaterials = ({
  enabled,
  ...props
}: HistoryReportMaterialsApiProps & {enabled?: boolean}) =>
  useQuery({
    queryKey: [QUERY_KEYS.HISTORY_REPORT_MATERIALS, props],
    queryFn: () => taskServices.getHistoryReportMaterials(props),
    ...DEFAULT_PERSISTENCE_CONFIG,
    enabled: enabled && !!props?.idJob && !!props?.id,
  });

export const useGetReportMaterialsInventory = (
  props: ReportMaterialsInventoryApiProps,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT_MATERIALS_INVENTORY, props],
    queryFn: () => taskServices.getReportMaterialsInventory(props),
    enabled:
      !!props?.idJob && !!props.filter && props.filter?.trim()?.length > 0,
    // gcTime: 0,
    // staleTime: 0
    // ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useGetReportMaterialsInventoryAll = ({idJob}: {idJob?: number}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALL_REPORT_MATERIALS_INVENTORY, {idJob}],
    queryFn: () => taskServices.getReportMaterialsInventoryAll({idJob: idJob!}),
    enabled: !!idJob, // sin filtro, solo exige idJob
    staleTime: 7 * DAY, // refresca cada 7 días
    gcTime: 8 * DAY, // un poco más largo que staleTime
    refetchOnMount: 'always', // si está stale, refetch al abrir
    refetchOnReconnect: true, // si vuelve internet y está stale
    refetchInterval: false, // no necesitamos polling
    // select: (rows) => rows.map(...), // opcional si quieres transformar
  });
};

export const useRegisterOneReportMaterial = () => {
  return useMutation({
    mutationFn: taskServices.registerOneReportMaterial,
  });
};

export const useGetWoAttachments = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WO_ATTACHMENTS, props],
    queryFn: () => taskServices.getWoAttachments(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useGetBOLCount = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOL_COUNT, props],
    queryFn: () => taskServices.getBOLCount(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useSaveBOLCount = () => {
  return useMutation({
    mutationFn: taskServices.saveBOLCount,
  });
};

export const useGetLaborReports = ({
  enabled = true,
  ...props
}: LaborReportsApiProps & {enabled?: boolean}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LABOR_REPORTS, props],
    queryFn: () => taskServices.getLaborReports(props),
    enabled: !!props?.idJob && props.toClockout != null && enabled,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useRegisterLaborReport = () => {
  return useMutation({
    mutationFn: taskServices.registerLaborReport,
  });
};

export const useGetEmployees = (props: EmployeesApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, props],
    queryFn: () => taskServices.getEmployees(props),
    enabled: !!props.filter && props.filter?.trim()?.length > 0,
    // gcTime: 0,
    // staleTime: 0
    // ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useGetLaborCodes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.LABOR_CODES],
    queryFn: taskServices.getLaborCodes,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};
