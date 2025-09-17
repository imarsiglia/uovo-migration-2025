import {QUERY_KEYS} from '@api/contants/constants';
import {reportServices} from '@api/services/reportServices';
import {TaskBaseApiProps} from '@api/services/taskServices';
import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: keepPreviousData,
};

export const useGetResumeConditionReport = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RESUME_CONDITION_REPORT, props],
    queryFn: () => reportServices.getResumeConditionReport(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useGetResumeConditionCheck = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RESUME_CONDITION_CHECK, props],
    queryFn: () => reportServices.getResumeConditionCheck(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useSaveConditionReport = () => {
  return useMutation({
    mutationFn: reportServices.saveConditionReport,
  });
};

export const useGetConditionReportbyInventory = (props: {
  idJobInventory: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONDITION_REPORT_BY_INVENTORY, props],
    queryFn: () => reportServices.getConditionReportbyInventory(props),
    enabled: !!props?.idJobInventory,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};
