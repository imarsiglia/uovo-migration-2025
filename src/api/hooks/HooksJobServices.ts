import {JOBQUEUE_START_DATE, QUERY_KEYS} from '@api/contants/constants';
import {JobQueueApiProps, jobServices} from '@api/services/jobServices';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {getFormattedDateWithTimezone} from '@utils/functions';

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
    placeholderData: keepPreviousData,
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
