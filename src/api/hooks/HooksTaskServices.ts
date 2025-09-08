import {QUERY_KEYS} from '@api/contants/constants';
import {
  HistoryReportMaterialsApiProps,
  ReportMaterialsInventoryApiProps,
  SignaturesApiProps,
  TaskBaseApiProps,
  taskServices,
} from '@api/services/taskServices';
import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: keepPreviousData,
};

export const useGetSignatures = (props: SignaturesApiProps) => {
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

export const useGetReportMaterials = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT_MATERIALS, props],
    queryFn: () => taskServices.getReportMaterials(props),
    enabled: !!props?.idJob,
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
    queryKey: [QUERY_KEYS.REPORT_MATERIALS, props],
    queryFn: () => taskServices.getReportMaterialsInventory(props),
    enabled: !!props?.idJob && !!props.filter && props.filter.trim().length > 0,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};
