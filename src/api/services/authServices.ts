import {UserType} from '@api/types/User';
import {
  API_LOGIN,
  API_REFRESH_TOKEN,
  API_REGULAR_LOGIN,
  API_UPDATE_USER,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {postRequest} from '@api/helpers/apiClientHelper';

type PropsLogin = {
  token: string;
  timeZone: string;
  deviceId: string;
  model: string;
  brand: string;
  buildNumber: string;
  osVersion: string;
};

const login = async (props: PropsLogin): Promise<UserType> => {
  const response = await postRequest<UserType>(API_LOGIN, props);
  return response.body;
};

type PropsRefresgToken = {
  timeZone: string;
  deviceId: string;
  model: string;
  brand: string;
  buildNumber: string;
  osVersion: string;
};
const refreshToken = async (props: PropsRefresgToken): Promise<UserType> => {
  const response = await postRequest<UserType>(API_REFRESH_TOKEN, props);
  return response.body;
};

type PropsRegularLogin = {
  username: string;
  password: string;
  timeZone: string;
  deviceId: string;
  model: string;
  brand: string;
  buildNumber: string;
  osVersion: string;
};

const regularLogin = async (props: PropsRegularLogin): Promise<UserType> => {
  const response = await postRequest<UserType>(API_REGULAR_LOGIN, props);
  return response.body;
};

type UpdateUserApiProps = {
  firstname: string;
  lastname: string;
  phone: string;
  photo?: string | null;
};

const updateUser = async (props: UpdateUserApiProps): Promise<boolean> => {
  const response = await postRequest<boolean>(API_UPDATE_USER, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export const authServices = {
  login,
  refreshToken,
  regularLogin,
  updateUser,
};
