import {
  INVENTORY_ORDER_TYPE,
  InventoryFilterOrderType,
} from '@generalTypes/general';
import {create} from 'zustand';

export type InventoryStore = {
  orderType?: InventoryFilterOrderType;
  setOrderType: (val: InventoryFilterOrderType) => void;
  orderFilter?: any;
  setOrderFilter: (val: any) => void;
  topSheetFilter?: string;
  setTopSheetFilter: (val: any) => void;
  inventoryFilter?: string;
  setInventoryFilter: (val: any) => void;
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  orderType: undefined,
  setOrderType: (val) => set((state) => ({...state, orderType: val})),
  orderFilter: undefined,
  setOrderFilter: (val) => set((state) => ({...state, orderFilter: val})),
  topSheetFilter: '',
  setTopSheetFilter: (val) => set((state) => ({...state, topSheetFilter: val})),
  inventoryFilter: '',
  setInventoryFilter: (val) => set((state) => ({...state, inventoryFilter: val})),
}));

export default useInventoryStore;
