import {QUERY_KEYS} from '@api/contants/constants';
import {
  GetJobInventoryApiProps,
  inventoryServices,
} from '@api/services/inventoryServices';
import {JobInventoryType} from '@api/types/Inventory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const DEFAULT_PERSISTENCE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
  retry: 1,
  placeholderData: keepPreviousData,
};

export const useGetJobInventory = (
  props: GetJobInventoryApiProps,
  options?: UseQueryOptions<JobInventoryType[] | undefined, Error> | undefined,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.JOB_INVENTORY, props],
    queryFn: () => inventoryServices.getJobInventory(props),
    enabled: !!props?.idJob,
    ...DEFAULT_PERSISTENCE_CONFIG,
    ...options,
  });
};

export const useUpdateInventoryStatus = () => {
  return useMutation({
    mutationFn: inventoryServices.updateInventoryStatus,
  });
};

export const useUpdateAllInventoryStatus = () => {
  return useMutation({
    mutationFn: inventoryServices.updateAllInventoryStatus,
  });
};

export const usePrepareInventory = () => {
  return useMutation({
    mutationFn: inventoryServices.prepareInventory,
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationFn: inventoryServices.deleteItem,
  });
};
