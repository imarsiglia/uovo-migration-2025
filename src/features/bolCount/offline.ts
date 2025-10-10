import {ENTITY_TYPES} from '@api/contants/constants';
import {SaveBOLCountApiProps} from '@api/services/taskServices';
import {enqueueCoalesced} from '@offline/outbox';

// 🔁 Encola un "upsert" coalescible por entidad+idJob (último gana)
export async function offlineUpdateBOLCount({
  idJob,
  pbs,
  packageCount,
  clientId,
}: SaveBOLCountApiProps & {clientId: string}) {
  await enqueueCoalesced('update', {
    clientId,
    entity: ENTITY_TYPES.BOL_COUNT,
    idJob,
    body: {idJob, pbs, packageCount},
  });
}
