import axios from 'axios';
import {API, API_CONTEXT} from '@env';
import {fetchUserTokenFromStorage} from '@api/helpers/apiClientHelper';
import {authState} from '@store/auth';

export const BASE_URL_ENDPOINTS = `${API}${API_CONTEXT}`;

// Configurar Axios
const apiClient = axios.create({
  //descomentar
  // baseURL, // La URL base para tus servicios
  baseURL: BASE_URL_ENDPOINTS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      console.log('cerrar session interceptor');
      // token vencido o inválido → cerrar sesión
      authState.clear();
    }
    return Promise.reject(error);
  },
);

// Agregar el token a las solicitudes de Axios
apiClient.interceptors.request.use(
  async (config) => {
    const userToken = authState.token;
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
