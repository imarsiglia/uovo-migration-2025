import axios from 'axios';
import {Alert} from 'react-native';
import {API, API_CONTEXT} from '@env';
import {fetchUserTokenFromStorage} from '@api/helpers/apiClientHelper';
import {authState} from '@store/auth';

export const URL_API = API;
export const BASE_URL_ENDPOINTS = `${API}${API_CONTEXT}`;

const TIMEOUT_MAX = 300000;
const TIMEOUT_ERROR_MESSAGE = 'SERVICIO NO DISPONIBLE';

const isTimeoutError = (error: any) => {
  const msg = String(error?.message ?? '').toLowerCase();

  return (
    msg.includes('timeout') ||
    error?.code === 'ECONNABORTED' || // típico de axios cuando expira timeout
    (axios.isCancel?.(error) && msg.includes('timeout'))
  );
};

// Configurar Axios
const apiClient = axios.create({
  baseURL: BASE_URL_ENDPOINTS,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: TIMEOUT_MAX,
  timeoutErrorMessage: TIMEOUT_ERROR_MESSAGE,
});

// Request interceptor: token + cancel por timeout (igual que fetch.ts)
apiClient.interceptors.request.use(
  async (config) => {
    // token
    const userToken = authState.token ?? (await fetchUserTokenFromStorage?.());
    if (userToken) {
      config.headers = config.headers ?? {};
      // @ts-ignore (si tu tipo de headers es estricto)
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }

    // cancel token + timer (patrón fetch.ts)
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    const timeoutId = setTimeout(() => {
      source.cancel('timeout');
    }, TIMEOUT_MAX);

    // guardar timeoutId para limpiarlo luego
    (config as any).metadata = {...((config as any).metadata ?? {}), timeoutId};

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: limpiar timer + manejar timeout + 401
apiClient.interceptors.response.use(
  (res) => {
    const timeoutId = (res.config as any)?.metadata?.timeoutId;
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  },
  (error) => {
    const timeoutId = (error.config as any)?.metadata?.timeoutId;
    if (timeoutId) clearTimeout(timeoutId);

    // 401: token vencido o inválido → cerrar sesión
    if (error?.response?.status === 401) {
      authState.clear();
      return Promise.reject(error);
    }

    // manejo de timeout (similar a fetch.ts)
    if (isTimeoutError(error)) {
      Alert.alert(
        'Oops!',
        'Something went wrong in server, please contact support.',
      );
      return Promise.reject(error);
    }

    // (opcional) manejo básico de network error como en fetch.ts
    if (error?.message === 'Network Error') {
      Alert.alert('Network issue was detected, please verify your connection');
    }

    return Promise.reject(error);
  },
);

export default apiClient;
