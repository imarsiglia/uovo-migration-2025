import {
  API_DELETE_INVENTORY_ITEM,
  API_GET_JOB_INVENTORY,
  API_PREPARE_INVENTORY,
  API_UPDATE_ALL_INVENTORY_STATUS,
  API_UPDATE_INVENTORY_STATUS,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {JobInventoryType} from '@api/types/Inventory';
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
  console.log("get job inventory")
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
  status: string;
};

const updateInventoryStatus = async (
  props: InventoryStatusApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_UPDATE_INVENTORY_STATUS, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type AllInventoryStatusApiProps = {
  status: string;
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

export const inventoryServices = {
  getJobInventory,
  updateInventoryStatus,
  updateAllInventoryStatus,
  prepareInventory,
  deleteItem,
};
