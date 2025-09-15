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

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: (prev: any) => prev,
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
    ...DEFAULT_PERSISTENCE_CONFIG,
    queryKey: [QUERY_KEYS.PACKING_DETAILS],
    queryFn: generalServices.getPackingDetails,
  });
};
