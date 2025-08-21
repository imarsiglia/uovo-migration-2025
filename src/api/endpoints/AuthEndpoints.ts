import {API_LOGIN} from '../contants/endpoints';
import {getFetcher, postFetcher} from '../general/fetchers';

export const AuthEndpoints = {
  login: (data: any) => postFetcher(API_LOGIN, data),
};
