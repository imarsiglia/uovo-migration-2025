import {ENTITY_TYPES} from '@api/contants/constants';
import {SaveBOLCountApiProps} from '@api/services/taskServices';
import {enqueueCoalesced} from '@offline/outbox';

export type BOLCountShape = {
  pbs: string; // 'Yes' | 'No' en tu UI
  packageCount: number;
  // Campos estándar offline (opcionales para cache local)
  update_time?: string;
  _pending?: boolean;
};

// 🔁 Encola un "upsert" coalescible por entidad+idJob (último gana)
export async function offlineUpdateBOLCount({
  idJob,
  pbs,
  packageCount,
}: SaveBOLCountApiProps) {
  await enqueueCoalesced('update', {
    entity: ENTITY_TYPES.BOL_COUNT,
    idJob,
    body: {idJob, pbs, packageCount},
  });
}
