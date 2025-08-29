import {useQuery} from '@tanstack/react-query';
import {NSEndpoints, NSRequestType} from '@api/endpoints/NSEndpoints';
import {QUERY_KEYS} from '@api/contants/constants';

export const useGetLocationPlaces = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.NS_LOCATION_PLACES],
    queryFn: NSEndpoints.getLocationPlaces,
    select({body: {data}}) {
      return data ?? [];
    },
  });
};

export const useGetEastCoastPickup = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_EAST_COAST_PICKUP, param],
    queryFn: () => NSEndpoints.getEastCoastPickup(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetWestCoastPickup = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_WEST_COAST_PICKUP, param],
    queryFn: () => NSEndpoints.getWestCoastPickup(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetWestCoastDropoff = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_WEST_COAST_DROPOFF, param],
    queryFn: () => NSEndpoints.getWestCoastDropoff(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetEastCoastDropoff = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_EAST_COAST_DROPOFF, param],
    queryFn: () => NSEndpoints.getEastCoastDropoff(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetInventoryEastCoastPickup = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_INVENTORY_EAST_COAST_PICKUP, param],
    queryFn: () => NSEndpoints.getInventoryEastCoastPickup(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetInventoryWestCoastPickup = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_INVENTORY_WEST_COAST_PICKUP, param],
    queryFn: () => NSEndpoints.getInventoryWestCoastPickup(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetInventoryWestCoastDropoff = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_INVENTORY_WEST_COAST_DROPOFF, param],
    queryFn: () => NSEndpoints.getInventoryWestCoastDropoff(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetInventoryEastCoastDropoff = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_EAST_COAST_DROPOFF, param],
    queryFn: () => NSEndpoints.getInventoryEastCoastDropoff(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetUniqueRoutePickup = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_UNIQUE_ROUTE_PICKUP, param],
    queryFn: () => NSEndpoints.getUniqueRoutePickup(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetUniqueRouteDropoff = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_UNIQUE_ROUTE_DROPOFF, param],
    queryFn: () => NSEndpoints.getUniqueRouteDropoff(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetInventoryUniqueRoutePickup = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_INVENTORY_UNIQUE_ROUTE_PICKUP, param],
    queryFn: () => NSEndpoints.getInventoryUniqueRoutePickup(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};

export const useGetInventoryUniqueRouteDropoff = (param: NSRequestType) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [QUERY_KEYS.NS_INVENTORY_UNIQUE_ROUTE_DROPOFF, param],
    queryFn: () => NSEndpoints.getInventoryUniqueRouteDropoff(param),
    gcTime: 0,
    select(data) {
      return data?.body?.data ?? [];
    },
    enabled: param.location != '-1',
  });
};
