import {JobDetailType} from '@api/types/Jobs';
import {create} from 'zustand';

export type TopSheetStore = {
  jobDetail?: JobDetailType;
  setJobDetail: (val?: JobDetailType) => void;
  activeTab?: number;
  setActiveTab: (val?: number) => void;
};

export const useTopSheetStore = create<TopSheetStore>((set) => ({
  jobDetail: undefined,
  setJobDetail: (job) => set((state) => ({...state, jobDetail: job})),
  activeTab: undefined,
  setActiveTab: (tab) => set((state) => ({...state, activeTab: tab})),
}));

export default useTopSheetStore;
