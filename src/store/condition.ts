import {
  ConditionPhotoSideType,
  ConditionType,
  StickyNoteType,
} from '@api/types/Condition';
import {create} from 'zustand';

export type ConditionStore = {
  conditionType?: ConditionType;
  setConditionType: (val?: ConditionType) => void;
  conditionPhotoType?: ConditionPhotoSideType;
  setConditionPhotoType: (val?: ConditionPhotoSideType) => void;
  conditionId?: number;
  setConditionId: (val?: number) => void;
  inventoryId?: number;
  setInventoryId: (val?: number) => void;
  editModalFunction?: () => void;
  setEditModalFunction: (val?: () => void) => void;
  copyNote?: StickyNoteType;
  setCopyNote: (val?: StickyNoteType) => void;
  reportIdImage?: number;
  setReportIdImage: (val?: number) => void;
};

export const useConditionStore = create<ConditionStore>((set) => ({
  conditionType: undefined,
  setConditionType: (val) => set((state) => ({...state, conditionType: val})),
  conditionPhotoType: undefined,
  setConditionPhotoType: (val) =>
    set((state) => ({...state, conditionPhotoType: val})),
  conditionId: undefined,
  setConditionId: (val) => set((state) => ({...state, conditionId: val})),
  inventoryId: undefined,
  setInventoryId: (val) => set((state) => ({...state, inventoryId: val})),
  editModalFunction: undefined,
  setEditModalFunction: (val) =>
    set((state) => ({...state, editModalFunction: val})),
  copyNote: undefined,
  setCopyNote: (val) => set((state) => ({...state, copyNote: val})),
  reportIdImage: undefined,
  setReportIdImage: (val) => set((state) => ({...state, reportIdImage: val})),
}));

export default useConditionStore;
