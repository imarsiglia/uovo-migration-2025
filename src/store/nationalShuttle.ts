import { NSItemListType } from '@api/types/Jobs';
import {QueryObserverResult, RefetchOptions} from '@tanstack/react-query';
import {create} from 'zustand';

export type NationalShuttleStore = {
  inventoryList?: NSItemListType[];
  setInventoryList: (val: NSItemListType[]) => void;
  fetchInventory?: () => (options?: RefetchOptions) => Promise<QueryObserverResult<any, Error>>;
  setFetchInventory: (val: () => (options?: RefetchOptions) => Promise<QueryObserverResult<any, Error>>) => void;
  isInventoryMode?: boolean;
  setIsInventoryMode: (val: boolean) => void;
};

export const useNationalShuttleStore = create<NationalShuttleStore>((set) => ({
  inventoryList: [],
  setInventoryList: (inventoryList) =>
    set((state) => ({...state, inventoryList})),
  fetchInventory: undefined,
  setFetchInventory: (fetchInventory) =>
    set((state) => ({...state, fetchInventory})),
  isInventoryMode: false,
  setIsInventoryMode: (isInventoryMode) =>
    set((state) => ({...state, isInventoryMode})),
}));

export default useNationalShuttleStore;
