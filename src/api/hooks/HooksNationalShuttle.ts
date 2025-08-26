import {useQuery} from '@tanstack/react-query';
import { NSEndpoints } from '../endpoints/NSEndpoints';

export const useGetLocationPlaces = () => {
  return useQuery({
    queryKey: [`location_places`],
    queryFn: NSEndpoints.getLocationPlaces,
    select({data}) {
      return data?.body?.data ?? [];
    },
  });
};

export const useGetEastCoastPickup = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`east_coast_pickup`],
    queryFn: () => NSEndpoints.getEastCoastPickup(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetWestCoastPickup = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`west_coast_pickup`],
    queryFn: () => NSEndpoints.getWestCoastPickup(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetWestCoastDropoff = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`west_coast_dropoff`],
    queryFn: () => NSEndpoints.getWestCoastDropoff(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetEastCoastDropoff = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`east_coast_dropoff`],
    queryFn: () => NSEndpoints.getEastCoastDropoff(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};


export const useGetInventoryEastCoastPickup = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`inventory_east_coast_pickup`],
    queryFn: () => NSEndpoints.getInventoryEastCoastPickup(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetInventoryWestCoastPickup = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`inventory_west_coast_pickup`],
    queryFn: () => NSEndpoints.getInventoryWestCoastPickup(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetInventoryWestCoastDropoff = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`inventory_west_coast_dropoff`],
    queryFn: () => NSEndpoints.getInventoryWestCoastDropoff(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetInventoryEastCoastDropoff = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`inventory_east_coast_dropoff`],
    queryFn: () => NSEndpoints.getInventoryEastCoastDropoff(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetUniqueRoutePickup = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`unique_route_pickup`],
    queryFn: () => NSEndpoints.getUniqueRoutePickup(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetUniqueRouteDropoff = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`unique_route_dropoff`],
    queryFn: () => NSEndpoints.getUniqueRouteDropoff(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};

export const useGetInventoryUniqueRoutePickup = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`inventory_unique_route_pickup`],
    queryFn: () => NSEndpoints.getInventoryUniqueRoutePickup(param),
    gcTime: 0
  });
};

export const useGetInventoryUniqueRouteDropoff = (param: string) => {
  return useQuery({
    refetchOnMount: false,
    queryKey: [`inventory_unique_route_dropoff`],
    queryFn: () => NSEndpoints.getInventoryUniqueRouteDropoff(param),
    gcTime: 0,
    select({data}) {
      return data?.body?.data ?? [];
    }
  });
};