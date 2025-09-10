import {JobDetailType} from '@api/types/Jobs';
import {BooleanNumberType} from '@generalTypes/general';
import {create} from 'zustand';

export type TopSheetStore = {
  jobDetail?: JobDetailType;
  setJobDetail: (val?: JobDetailType) => void;
  activeTab?: number;
  setActiveTab: (val?: number) => void;
  signatureForce?: boolean;
  setSignatureForce?: (val: boolean) => void;
  toClockout?: BooleanNumberType;
  setToClockout?: (val: BooleanNumberType) => void;
  isJobQueue?: BooleanNumberType;
  setIsJobQueue?: (val: BooleanNumberType) => void;
};

export const useTopSheetStore = create<TopSheetStore>((set) => ({
  jobDetail: undefined,
  setJobDetail: (job) => set((state) => ({...state, jobDetail: job})),
  activeTab: 0,
  setActiveTab: (tab) => set((state) => ({...state, activeTab: tab})),
  signatureForce: false,
  setSignatureForce: (val) => set((state) => ({...state, signatureForce: val})),
  toClockout: 1,
  setToClockout: (val) => set((state) => ({...state, toClockout: val})),
  isJobQueue: undefined,
  setIsJobQueue: (val) => set((state) => ({...state, isJobQueue: val})),
}));

export default useTopSheetStore;
