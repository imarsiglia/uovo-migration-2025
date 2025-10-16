import {QUERY_KEYS} from '@api/contants/constants';
import {
  GetPhotosConditionApiProps,
  PhotoConditionDetailApiProps,
  PhotoConditionOverviewApiProps,
  reportServices,
} from '@api/services/reportServices';
import {TaskBaseApiProps} from '@api/services/taskServices';
import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: keepPreviousData,
  refetchOnMount: 'always' as const,
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

export const useGetConditionCheckbyInventory = (props: {
  idJobInventory: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONDITION_CHECK_BY_INVENTORY, props],
    queryFn: () => reportServices.getConditionCheckbyInventory(props),
    enabled: !!props?.idJobInventory,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useSaveConditionCheck = () => {
  return useMutation({
    mutationFn: reportServices.saveConditionCheck,
  });
};

export const useGetTotalPhotosConditionReport = (props: {id: number}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOTAL_PHOTOS_CONDITION_REPORT, props],
    queryFn: () => reportServices.getTotalPhotosConditionReport(props),
    enabled: !!props?.id,
    ...DEFAULT_PERSISTENCE_CONFIG,
    placeholderData: [
      {
        type: 'back',
        total: 0,
      },
      {
        type: 'front',
        total: 0,
      },
      {
        type: 'sides',
        total: 0,
      },
      {
        type: 'details',
        total: 0,
      },
    ],
  });
};

export const useGetTotalPhotosConditionCheck = (props: {id: number}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOTAL_PHOTOS_CONDITION_CHECK, props],
    queryFn: () => reportServices.getTotalPhotosConditionCheck(props),
    enabled: !!props?.id,
    ...DEFAULT_PERSISTENCE_CONFIG,
    placeholderData: [
      {
        type: 'back',
        total: 0,
      },
      {
        type: 'front',
        total: 0,
      },
      {
        type: 'details',
        total: 0,
      },
    ],
  });
};

export const useGetPhotosCondition = (props: GetPhotosConditionApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PHOTOS_CONDITION, props],
    queryFn: () => reportServices.getPhotosCondition(props),
    enabled: !!props?.conditionType && !!props.reportId && !!props.sideType,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useRemovePhotoCondition = () => {
  return useMutation({
    mutationFn: reportServices.removePhotoCondition,
  });
};

export const useSavePhotoCondition = () => {
  return useMutation({
    mutationFn: reportServices.savePhotoCondition,
  });
};

export const useGetPhotoConditionOverview = (
  props: PhotoConditionOverviewApiProps,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PHOTO_CONDITION_OVERVIEW, props],
    queryFn: () => reportServices.getPhotoConditionOverview(props),
    enabled: !!props?.conditionType && !!props.id,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useGetPhotoConditionDetail = (
  props: PhotoConditionDetailApiProps,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PHOTO_CONDITION_DETAIL, props],
    queryFn: () => reportServices.getPhotoConditionDetail(props),
    enabled: !!props?.conditionType && !!props.id,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};
