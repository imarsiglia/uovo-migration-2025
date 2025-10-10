import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';
import {
  EstimatedTimeByLocationProps,
  generalServices,
} from '@api/services/generalServices';
import {
  DEFAULT_WO_STATUS_LIST,
  DEFAULT_WO_TYPE_LIST,
  QUERY_KEYS,
} from '@api/contants/constants';
import { DAYS_IN_MS } from './HooksTaskServices';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: (prev: any) => prev,
  refetchOnMount: 'always' as const,
};

export const useContactUsService = () => {
  return useMutation({
    mutationFn: generalServices.contactUs,
  });
};

export const useHelpDeskService = () => {
  return useMutation({
    mutationFn: generalServices.helpDesk,
  });
};

export const useGetWoStatusList = () => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.WO_STATUS_LIST],
    queryFn: generalServices.getWoStatusList,
    initialData: DEFAULT_WO_STATUS_LIST,
    select: (data) => data.map((item) => ({id: item, name: item})),
  });
};

export const useGetWoTypeList = () => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.WO_TYPE_LIST],
    queryFn: generalServices.getWoTypeList,
    initialData: DEFAULT_WO_TYPE_LIST,
    select: (data) => data.map((item) => ({id: item, name: item})),
  });
};

export const useGetLocationPlaces = () => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.LOCATION_PLACES],
    queryFn: generalServices.getLocationPlaces,
  });
};

export const useGetLatLong = (address?: string | null) => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.GEOLOCATION_ADDRESS, address],
    queryFn: () => generalServices.getLatLong(address!),
    enabled: !!address,
    retry: 2,
    placeholderData: undefined,
  });
};

export const useGetEstimatedTimeByLocation = ({
  showEstimated,
  ...props
}: EstimatedTimeByLocationProps & {showEstimated?: boolean}) => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.GEOLOCATION_ADDRESS, props],
    queryFn: () => generalServices.getEstimatedTimeByLocation(props),
    enabled:
      !!props?.fromLat &&
      !!props?.fromLng &&
      !!props?.toLat &&
      !!props?.toLng &&
      showEstimated,
    retry: 2,
    refetchOnMount: false,
    placeholderData: undefined,
  });
};

export const useGetQrUser = () => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.QR_USER],
    queryFn: generalServices.getQrUser,
    enabled: false,
  });
};

export const useGetPackingDetails = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PACKING_DETAILS],
    queryFn: generalServices.getPackingDetails,
    staleTime: 7 * DAYS_IN_MS, // refresca cada 7 días
    gcTime: 8 * DAYS_IN_MS, // un poco más largo que staleTime
    refetchOnMount: 'always', // si está stale, refetch al abrir
    refetchOnReconnect: true, // si vuelve internet y está stale
    refetchInterval: false, // no necesitamos polling
  });
};

export const useGetPlacesConditionReport = () => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.PLACES_CONDITION_REPORT],
    queryFn: generalServices.getPlacesConditionReport,
  });
};

export const useGetArtists = ({filter}: {filter: string}) => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.ARTISTS, {filter}],
    queryFn: () => generalServices.getArtists({filter}),
    enabled: filter.trim().length > 2,
  });
};

export const useGetArtTypes = ({filter}: {filter: string}) => {
  return useQuery({
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.ART_TYPES, {filter}],
    queryFn: () => generalServices.getArtTypes({filter}),
    enabled: filter.trim().length > 1,
  });
};
