import {QUERY_KEYS} from '@api/contants/constants';
import {
  GetJobInventoryApiProps,
  InventoryItemDetailApiProps,
  inventoryServices,
  SearchInventoryItemApiProps,
} from '@api/services/inventoryServices';
import {JobInventoryType, MinimalInventoryType} from '@api/types/Inventory';
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
  refetchOnMount: 'always' as const,
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

export const useSearchInventoryItem = (
  props: SearchInventoryItemApiProps,
  options?: UseQueryOptions<string[] | undefined, Error> | undefined,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_INVENTORY_ITEM, props],
    queryFn: () => inventoryServices.searchInventoryItem(props),
    enabled: !!props?.idJob && !!props.type,
    ...DEFAULT_PERSISTENCE_CONFIG,
    ...options,
  });
};

export const useSearchFullInventory = ({
  enabled,
  ...props
}: SearchInventoryItemApiProps & {enabled?: boolean}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_FULL_INVENTORY, props],
    queryFn: () => inventoryServices.searchFullInventory(props),
    enabled: enabled,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useAddInventoryItem = () => {
  return useMutation({
    mutationFn: inventoryServices.addInventoryItem,
  });
};

export const useGetInventoryItemDetail = (
  props: InventoryItemDetailApiProps,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_ITEM_DETAIL, props],
    queryFn: () => inventoryServices.getInventoryItemDetail(props),
    enabled: !!props.id,
    ...DEFAULT_PERSISTENCE_CONFIG,
  });
};

export const useUpdateInventoryItem = () => {
  return useMutation({
    mutationFn: inventoryServices.updateInventoryItemDetail,
  });
};
