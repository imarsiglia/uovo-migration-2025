import {
  API__GET_LOCATION_PLACES,
  API__GET_WO_STATUS,
  API__GET_WO_TYPES,
  API_CONTACT_US,
  API_HELPDESK,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import { GeneralListApi, Paginated } from '@api/types/Response';

type PropsContactUs = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
  name: string;
  email: string;
};
const contactUs = async (props: PropsContactUs): Promise<boolean> => {
  const response = await postRequest(API_CONTACT_US, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

type PropsHelpDesk = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
};
const helpDesk = async (props: PropsHelpDesk): Promise<boolean> => {
  const response = await postRequest(API_HELPDESK, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

const getWoStatusList = async (): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(API__GET_WO_STATUS);
  return response.body?.data;
};

const getWoTypeList = async (): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(API__GET_WO_TYPES);
  return response.body?.data;
};

const getLocationPlaces = async (): Promise<GeneralListApi[]> => {
  const response = await getRequest<Paginated<GeneralListApi[]>>(API__GET_LOCATION_PLACES);
  return response.body?.data;
};

export const generalServices = {
  contactUs,
  helpDesk,
  getWoStatusList,
  getWoTypeList,
  getLocationPlaces
};
