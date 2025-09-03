import {JOBQUEUE_START_DATE, QUERY_KEYS} from '@api/contants/constants';
import {
  JobQueueApiProps,
  jobServices,
  LetsGoApiProps,
  LocationNotesApiProps,
  TopSheetApiProps,
} from '@api/services/jobServices';
import {
  keepPreviousData,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import {getFormattedDateWithTimezone} from '@utils/functions';

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
    queryKey: [QUERY_KEYS.CALENDAR, date],
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
