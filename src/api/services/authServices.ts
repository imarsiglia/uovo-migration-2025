import {UserType} from '@api/types/User';
import {API_LOGIN, API_REFRESH_TOKEN} from '@api/contants/endpoints';
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

export const authServices = {
  login,
  refreshToken,
};
