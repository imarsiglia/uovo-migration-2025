import {ENTITY_TYPES} from '@api/contants/constants';
import {UpdateInventoryDetailApiProps} from '@api/services/inventoryServices';
import {JobInventoryType} from '@api/types/Inventory';
import {enqueueCoalesced} from '@offline/outbox';

export type ItemInventoryOfflineProps = {
  id?: number;
  clientId?: string; // required for offline support
} & UpdateInventoryDetailApiProps;

export async function offlineUpdateItemInventory({
  id,
  clientId,
  ...rest
}: ItemInventoryOfflineProps) {
  if (!id && !clientId)
    throw new Error('offlineUpdateItemInventory requires id or clientId');
  return enqueueCoalesced('update', {
    entity: ENTITY_TYPES.ITEM_INVENTORY_DETAIL,
    id,
    clientId,
    body: {
      ...rest,
    },
  });
}

export async function offlineDeleteItemInventory({
  id,
  clientId,
}: ItemInventoryOfflineProps) {
  if (!id && !clientId)
    throw new Error('offlineDeleteItemInventory requires id or clientId');
  return enqueueCoalesced('delete', {
    entity: ENTITY_TYPES.ITEM_INVENTORY_DETAIL,
    id,
    clientId,
  });
}
