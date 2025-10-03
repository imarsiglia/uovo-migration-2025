import apiClient from '@api/config/apiClient';
import {ApiResponse} from '@api/types/Response';
import {openGeneralDialog} from '@store/actions';
import {navigate, replaceScreen} from '@utils/navigationService';
import {getFromStorage, STORAGE_KEYS} from '@utils/storage';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

export const fetchUserTokenFromStorage = () => {
  return getFromStorage<string>(STORAGE_KEYS.USER_TOKEN);
};

/**
 * Realiza una petición POST genérica con manejo de errores.
 */
export const postRequest = async <T>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig<any>,
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<ApiResponse<T>>(
      endpoint,
      data,
      config,
    );
    handleResponse(response);
    return {
      ...response.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error: any) {
    handleError(error);
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error(error ?? 'Error en la solicitud');
  }
};

export const getRequest = async <T>(
  endpoint: string,
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(endpoint);

    handleResponse(response);

    return {
      ...response.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error: any) {
    handleError(error);
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error(error?.message || 'Error en la solicitud');
  }
};

export const getRequestString = async <T>(
  endpoint: string,
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<T>(endpoint);
    return {
      body: response.data,
      status: response.status,
      statusText: response.statusText,
      message: '',
      service: '',
    };
  } catch (error: any) {
    handleError(error);
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error(error?.message || 'Error en la solicitud');
  }
};

function handleResponse<T>(response: AxiosResponse<ApiResponse<T>, any>) {
  if (response.status == 299 && response.data.screen_route) {
    openGeneralDialog({
      modalVisible: true,
      message: response.data.message,
      type: 'info',
      confirmBtnLabel: 'Ok',
      cancelable: false,
      onConfirm: () =>
        replaceScreen(
          response.data.screen_route === 'BOLScreen'
            ? 'EditPieceCount'
            : (response.data.screen_route as any),
        ),
    });
  } else if (response.status == 299 || response.status == 298) {
    openGeneralDialog({
      modalVisible: true,
      message: response.data.message,
      type: 'info',
      confirmBtnLabel: 'Ok',
      cancelable: false,
    });
  }
}

type ErrorMap = {
  [key: string]: string;
};

const errorMessages: ErrorMap = {
  'Request failed with status code 404': 'Server is unavailable',
  'Request failed with status code 500':
    'Something went wrong in server, please contact support.',
  'Request failed with status code 400':
    'Something went wrong in server, please contact support.',
  'Network Error': 'Network issue was detected, please verify your connection',
};

function handleError(error: any) {
  // Caso especial: timeout
  if (error.message.includes('timeout')) {
    showErrorToastMessage(
      'Something went wrong in server, please contact support.',
    );
    return;
  }

  // Buscar mensaje en el mapa
  const userMessage = errorMessages[error.message];
  if (userMessage) {
    showErrorToastMessage(userMessage);
  } else {
    // fallback
    showErrorToastMessage('Unexpected error occurred');
  }
}
