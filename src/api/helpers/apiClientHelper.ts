import apiClient from "@api/config/apiClient";
import { ApiResponse } from "@api/types/Response";
import { getFromStorage, STORAGE_KEYS } from "@utils/storage";
import { AxiosRequestConfig } from "axios";


export const fetchUserTokenFromStorage = () => {
  return getFromStorage<string>(STORAGE_KEYS.USER_TOKEN);
};

/**
 * Realiza una petición POST genérica con manejo de errores.
 */
export const postRequest = async <T>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig<any>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<ApiResponse<T>>(
      endpoint,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    // handleRequestError(error);
    throw new Error(error?.message || "Error en la solicitud")
  }
};

export const getRequest = async <T>(
  endpoint: string
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error: any) {
    // handleRequestError(error);
    throw new Error(error?.message || "Error en la solicitud");
  }
};