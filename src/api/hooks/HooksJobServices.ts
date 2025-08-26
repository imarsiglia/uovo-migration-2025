import {QUERY_KEYS} from '@api/contants/constants';
import {jobServices} from '@api/services/jobServices';
import {useQuery} from '@tanstack/react-query';
import {getFormattedDate} from '@utils/functions';

export const useGetCalendar = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return useQuery({
    queryKey: [QUERY_KEYS.CALENDAR, year, month],
    queryFn: () => jobServices.calendar(month, year),
    staleTime: 5 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
    placeholderData: (prev) => prev,
  });
};

export const useGetTimeline = (date?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CALENDAR, date],
    queryFn: () => jobServices.timeline(date!),
    staleTime: 5 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
    placeholderData: (prev) => prev,
    enabled: !!date
  });
};
