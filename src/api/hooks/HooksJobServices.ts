import {JOBQUEUE_START_DATE, QUERY_KEYS} from '@api/contants/constants';
import {
  JobQueueApiProps,
  jobServices,
  LetsGoApiProps,
  LocationNotesApiProps,
  SendEmailBOLProps,
  TaskCountApiProps,
  TopSheetApiProps,
} from '@api/services/jobServices';
import {TaskBaseApiProps} from '@api/services/taskServices';
import {ApiResponse} from '@api/types/Response';
import {
  keepPreviousData,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import {getFormattedDateWithTimezone} from '@utils/functions';
import {AxiosError} from 'axios';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: keepPreviousData,
};

export const useGetCalendar = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return useQuery({
    queryKey: [QUERY_KEYS.CALENDAR, year, month],
    queryFn: () => jobServices.calendar(month, year),
    // staleTime: 0,
    // gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
};

export const useGetTimeline = (date?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TIMELINE, date],
    queryFn: () => jobServices.timeline(date!),
    staleTime: 0,
    // staleTime: 5 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
    // placeholderData: keepPreviousData,
    enabled: !!date,
  });
};

export const useGetJobQueue = ({
  totalize = 1,
  start = 0,
  limit = 100,
  filter = '',
  orderBy,
  place,
}: JobQueueApiProps) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.JOB_QUEUE_LIST,
      {
        place,
        orderBy,
        filter,
        totalize,
        start,
        limit,
      },
    ],
    queryFn: () =>
      jobServices.jobqueue({
        place,
        orderBy,
        filter:
          orderBy === JOBQUEUE_START_DATE
            ? getFormattedDateWithTimezone(filter ?? new Date(), 'YYYY-MM-DD')
            : filter,
        totalize,
        start,
        limit,
      }),
    retry: 1,
  });
};

export const useGetTopsheet = (props: TopSheetApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOPSHEET, props],
    queryFn: () => jobServices.topsheet(props),
    staleTime: 0,
    // staleTime: 5 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
    placeholderData: undefined,
  });
};

export const useLetsGo = (
  props?: UseMutationOptions<unknown, Error, LetsGoApiProps, unknown>,
) => {
  return useMutation({
    mutationFn: (props: LetsGoApiProps) => jobServices.letsGo(props),
    ...props,
  });
};

export const useReportIssue = () => {
  return useMutation({
    mutationFn: jobServices.reportIssueLocation,
  });
};

export const useGetLocationNotes = (
  props: LocationNotesApiProps,
  options?: UseQueryOptions<any | undefined, Error> | undefined,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LOCATION_NOTES, props],
    queryFn: () => jobServices.locationNotes(props),
    // staleTime: 0,
    // gcTime: 7 * 24 * 60 * 60 * 1000,
    enabled: !!props?.idJob && !!props?.type,
    ...DEFAULT_PERSISTENCE_CONFIG,
    ...options,
  });
};

export const useSaveLocationNotes = () => {
  return useMutation({
    mutationFn: jobServices.saveLocationNotes,
  });
};

export const useSendEmailBOL = (
  props?: UseMutationOptions<
    ApiResponse<any>,
    AxiosError<ApiResponse<any>>,
    SendEmailBOLProps,
    unknown
  >,
  // props?: UseMutationOptions<unknown, Error, SendEmailBOLProps, unknown>,
) => {
  return useMutation({
    mutationFn: (props: SendEmailBOLProps) => jobServices.sendEmailBOL(props),
    ...props,
  });
};

export const useGetTaskCount = (props: TaskCountApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TASK_COUNT, props],
    queryFn: () => jobServices.getTaskCount(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
    placeholderData: [
      {
        description: 'BOL',
        id: 1,
        quantity: 0,
      },
      {
        description: 'Pictures',
        id: 2,
        quantity: 0,
      },
      {
        description: 'Notes',
        id: 3,
        quantity: 0,
      },
      {
        description: 'Report materials',
        id: 4,
        quantity: 0,
      },
      {
        description: 'Report',
        id: 5,
        quantity: 0,
      },
    ],
  });
};

export const useClockIn = () => {
  return useMutation({
    mutationFn: jobServices.clockIn,
  });
};

export const usePauseJob = () => {
  return useMutation({
    mutationFn: jobServices.pauseJob,
  });
};

export const useClockout = () => {
  return useMutation({
    mutationFn: jobServices.clockout,
  });
};

export const useResumeJob = () => {
  return useMutation({
    mutationFn: jobServices.resumeJob,
  });
};

export const useRemoveMemberTeam = () => {
  return useMutation({
    mutationFn: jobServices.removeMemberTeam,
  });
};

export const useGetBolPdf = (props: TaskBaseApiProps) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_BOL_PDF, props],
    queryFn: () => jobServices.getBolPdf(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};
