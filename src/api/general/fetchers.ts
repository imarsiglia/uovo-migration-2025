import axios from 'axios';
import {TIME_OUT_MESSAGE, TIME_OUT_REQUEST} from '../contants/messages';
import {getFromStorage, STORAGE_KEYS} from '@utils/storage';
import {BASE_URL_ENDPOINTS} from '@api/config/apiClient';

const getAxiosInstance = async () => {
  try {
    const token = await getFromStorage(STORAGE_KEYS.USER_TOKEN);
    const instance = axios.create({
      baseURL: BASE_URL_ENDPOINTS,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: TIME_OUT_REQUEST,
      timeoutErrorMessage: TIME_OUT_MESSAGE,
    });

    return instance;
  } catch (error) {
    // Manejo de errores o configuración alternativa si el token no está disponible
    return null;
  }
};

export const getFetcher = async (route: string) => {
  let source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel('timeout');
  }, TIME_OUT_REQUEST);

  const publicRest = await getAxiosInstance();
  if (!publicRest) {
    return createErrorMesage({
      code: 500,
      message: 'Axios instance not available',
    });
  }
  const response = await publicRest
    .get(route, {
      cancelToken: source.token,
    })
    .catch((error) => {
      return createErrorMesage(error);
    });
  return response;
};

export const postFetcher = async (route: string, data: any) => {
  let source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel('timeout');
  }, TIME_OUT_REQUEST);

  const publicRest = await getAxiosInstance();
  if (!publicRest) {
    return createErrorMesage({
      code: 500,
      message: 'Axios instance not available',
    });
  };
  const response = await publicRest
    .post(route, data, {
      cancelToken: source.token,
    })
    .catch((error) => {
      return createErrorMesage(error);
    });
  return response;
};

export const putFetcher = async (route: string, data: any) => {
  let source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel('timeout');
  }, TIME_OUT_REQUEST);

  const publicRest = await getAxiosInstance();
  if( !publicRest) {
    return createErrorMesage({
      code: 500,
      message: 'Axios instance not available',
    });
  }
  const response = await publicRest
    .put(route, data, {
      cancelToken: source.token,
    })
    .catch((error) => {
      return createErrorMesage(error);
    });
  return response;
};

export const deleteFetcher = async (route: string) => {
  let source = axios.CancelToken.source();
  setTimeout(() => {
    source.cancel('timeout');
  }, TIME_OUT_REQUEST);

  const publicRest = await getAxiosInstance();
  if (!publicRest) {
    return createErrorMesage({
      code: 500,
      message: 'Axios instance not available',
    });
  }
  const response = await publicRest
    .delete(route, {
      cancelToken: source.token,
    })
    .catch((error) => {
      return createErrorMesage(error);
    });
  return response;
};

function createErrorMesage(error: any) {
  let errorCode = error.code;
  let errorMessage = error.message;
  if (error.message == 'timeout') {
    errorCode = 600;
    errorMessage = TIME_OUT_MESSAGE;
  }
  return {
    ErrCode: errorCode,
    ErrMessage: errorMessage,
    HasError: true,
    data: {
      Status: errorCode,
      ErrMessage: errorMessage,
      HasError: true,
    },
  };
}
