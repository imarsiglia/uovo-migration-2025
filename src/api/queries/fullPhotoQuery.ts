// api/queries/fullPhotoQuery.ts
import {QUERY_KEYS} from '@api/contants/constants';
import {taskServices} from '@api/services/taskServices';
import {DAYS_IN_MS} from '@api/hooks/HooksTaskServices';
import {writePhotoFileForRef} from '@utils/image';

const STALE = 7 * DAYS_IN_MS;
const GC = 30 * DAYS_IN_MS;

export function fullPhotoQueryById(id: number) {
  return {
    key: [QUERY_KEYS.LOAD_FULL_IMAGE, {id}] as const,
    // 👇 NO cacheamos base64; devolvemos file://
    fn: async () => {
      const b64 = await taskServices.getFullImage({id});
      // Guardamos SIEMPRE en la misma ruta por id (sobrescribe)
      return writePhotoFileForRef({id}, b64, 'jpg'); // devuelve file://...
    },
    staleTime: STALE,
    gcTime: GC,
  };
}

// Para fotos offline (sin id, con clientId) — sin pedir a red
export function localPhotoQueryByClientId(clientId: string, base64: string) {
  return {
    key: [QUERY_KEYS.LOAD_FULL_IMAGE, {clientId}] as const,
    fn: async () => {
      // Escribe/reescribe el archivo y devuelve file://
      return writePhotoFileForRef({clientId}, base64, 'jpg');
    },
    staleTime: STALE,
    gcTime: GC,
  };
}
