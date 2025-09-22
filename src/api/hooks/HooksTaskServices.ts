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
import {IdReportMaterialType} from '@api/types/Task';
import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  // gcTime: 7 * 24 * 60 * 60 * 1000,
  gcTime: 0,
  retry: 1,
  placeholderData: keepPreviousData,
};

export const useGetSignatures = ({
  enabled = true,
  ...props
}: SignaturesApiProps & {enabled?: boolean}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNATURES, props],
    queryFn: () => taskServices.signatures(props),
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

export const useGetHistoryReportMaterials = (
  props: HistoryReportMaterialsApiProps,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.HISTORY_REPORT_MATERIALS, props],
    queryFn: () => taskServices.getHistoryReportMaterials(props),
    ...DEFAULT_PERSISTENCE_CONFIG,
    enabled: false,
  });
};

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
