// api/queries/fullPhotoQuery.ts
import {QUERY_KEYS} from '@api/contants/constants';
import {taskServices} from '@api/services/taskServices';
import {DAYS_IN_MS} from '@api/hooks/HooksTaskServices';
// import {writePhotoFileForRef} from '@utils/image';
import {base64ToFileCache} from '@utils/imageCache';

// const STALE = 7 * DAYS_IN_MS;
const GC = 30 * DAYS_IN_MS;

export function fullPhotoQueryById(params: {id: number; groupRev?: string}) {
  const {id, groupRev} = params;
  const rev = groupRev ?? 'nogrev';
  return {
    key: [QUERY_KEYS.LOAD_FULL_IMAGE, {id, groupRev: rev}] as const,
    fn: async () => {
      const b64 = await taskServices.getFullImage({id});
      // versiona el archivo con el rev del grupo
      return base64ToFileCache(b64, `jobimg_${id}_grp_${sanitize(rev)}.png`);
    },
    staleTime: Infinity, // mientras no cambie la key, no refetch
    refetchOnMount: false as const,
    gcTime: GC,
  };
}

/** Offline (foto sin id) – clientId + rev local o groupRev si lo tienes */
export function localPhotoQueryByClientId(params: {
  clientId: string;
  base64: string;
  groupRev?: string; // si el grupo ya tiene update_time
  localRev?: number; // si aún estás offline (fallback), p.ej. photo.length
  ext?: 'jpg' | 'png';
}) {
  const {clientId, base64, groupRev, localRev, ext = 'jpg'} = params;
  const rev = groupRev ?? String(localRev ?? base64.length);
  return {
    key: [QUERY_KEYS.LOAD_FULL_IMAGE, {clientId, groupRev: rev}] as const,
    fn: async () => {
      return base64ToFileCache(
        base64,
        `jobimg_local_${clientId}_grp_${sanitize(rev)}.${ext}`,
      );
    },
    staleTime: Infinity,
    refetchOnMount: false as const,
    gcTime: GC,
  };
}

function sanitize(s: string) {
  return s.replace(/[^0-9A-Za-z_-]/g, '');
}
