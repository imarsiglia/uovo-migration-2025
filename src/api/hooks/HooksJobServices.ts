import { QUERY_KEYS } from '@api/contants/constants';
import { jobServices } from '@api/services/jobServices';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useGetCalendar = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return useQuery({
    queryKey: [QUERY_KEYS.CALENDAR, year, month],
    queryFn: () => jobServices.calendar(month, year),
    staleTime: 0,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
    // placeholderData: (prev) => prev,
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
    // // placeholderData: (prev) => prev,
    placeholderData: keepPreviousData,
    enabled: !!date,
  });
};
