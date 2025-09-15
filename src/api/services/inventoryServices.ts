import {
  API_ADD_INVENTORY_ITEM,
  API_DELETE_INVENTORY_ITEM,
  API_GET_INVENTORY_ITEM_DETAIL,
  API_GET_JOB_INVENTORY,
  API_PREPARE_INVENTORY,
  API_SEARCH_FULL_INVENTORY,
  API_SEARCH_INVENTORY_ITEM,
  API_UPDATE_ALL_INVENTORY_STATUS,
  API_UPDATE_INVENTORY_ITEM_DETAIL,
  API_UPDATE_INVENTORY_STATUS,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {JobInventoryType, MinimalInventoryType} from '@api/types/Inventory';
import {Paginated} from '@api/types/Response';
import {InventoryFilterOrderType} from '@generalTypes/general';
import {TaskBaseApiProps} from './taskServices';

export type GetJobInventoryApiProps = {
  orderType?: InventoryFilterOrderType;
  orderFilter?: string;
  filter?: string;
} & TaskBaseApiProps;

const getJobInventory = async ({
  idJob,
  orderType,
  orderFilter,
  filter = '',
}: GetJobInventoryApiProps): Promise<JobInventoryType[]> => {
  const response = await getRequest<Paginated<JobInventoryType[]>>(
    `${API_GET_JOB_INVENTORY}?idjob=${idJob}&start=0&limit=200&totalize=1&filter=${filter.trim()}` +
      (orderType != undefined && orderFilter != undefined
        ? `&orderbytype=${orderType}&orderby=${orderFilter}`
        : ''),
  );
  return response.body.data;
};

export type InventoryStatusApiProps = {
  idInventory: number;
  status: string | null;
};

const updateInventoryStatus = async (
  props: InventoryStatusApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_UPDATE_INVENTORY_STATUS, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type AllInventoryStatusApiProps = {
  status: string | null;
} & TaskBaseApiProps;

const updateAllInventoryStatus = async (
  props: AllInventoryStatusApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_UPDATE_ALL_INVENTORY_STATUS, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

const prepareInventory = async ({
  idJob,
}: TaskBaseApiProps): Promise<boolean> => {
  const response = await postRequest(`${API_PREPARE_INVENTORY}/${idJob}`);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type DeleteInventoryItemApiProps = {
  id: number;
};

const deleteItem = async ({
  id,
}: DeleteInventoryItemApiProps): Promise<boolean> => {
  const response = await postRequest(`${API_DELETE_INVENTORY_ITEM}/${id}`);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type SearchInventoryItemApiProps = {
  filter?: string;
  type?: string;
} & TaskBaseApiProps;

const searchInventoryItem = async ({
  idJob,
  filter = '',
  type = '',
}: SearchInventoryItemApiProps): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(
    `${API_SEARCH_INVENTORY_ITEM}?idjob=${idJob}&filter=${filter.trim()}&type=${type.trim()}`,
  );
  return response.body.data;
};

const searchFullInventory = async ({
  idJob,
  filter = '',
  type = '',
}: SearchInventoryItemApiProps): Promise<MinimalInventoryType[]> => {
  const response = await getRequest<Paginated<MinimalInventoryType[]>>(
    `${API_SEARCH_FULL_INVENTORY}?idjob=${idJob}&filter=${filter.trim()}&type=${type.trim()}`,
  );
  return response.body.data;
};

export type AddInventoryItemApiProps = {
  idInventory: string;
} & TaskBaseApiProps;

const addInventoryItem = async (
  props: AddInventoryItemApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_ADD_INVENTORY_ITEM, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type InventoryItemDetailApiProps = {
  id?: number;
};
const getInventoryItemDetail = async ({
  id,
}: InventoryItemDetailApiProps): Promise<JobInventoryType> => {
  const response = await getRequest<JobInventoryType>(
    `${API_GET_INVENTORY_ITEM_DETAIL}/${id}`,
  );
  return response.body;
};

export type UpdateInventoryDetailApiProps = {
  idInventory: number;
  additional_info?: string;
  packed_height?: string;
  packed_length?: string;
  packed_width?: string;
  un_packed_height?: string;
  un_packed_length?: string;
  un_packed_width?: string;
  weight?: string;
  current_packing_detail_id?: string;
  current_packing_detail?: string;
};
const updateInventoryItemDetail = async (
  props: UpdateInventoryDetailApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_UPDATE_INVENTORY_ITEM_DETAIL, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export const inventoryServices = {
  getJobInventory,
  updateInventoryStatus,
  updateAllInventoryStatus,
  prepareInventory,
  deleteItem,
  searchInventoryItem,
  searchFullInventory,
  addInventoryItem,
  getInventoryItemDetail,
  updateInventoryItemDetail,
};
