import {create} from 'zustand';

export type GeneralStore = {
  isFilterActive?: boolean;
  setFilterActive: (active: boolean) => void;
  activeTab?: number;
  setActiveTab: (tab: number) => void;
  timelinePressed?: boolean;
  setTimelinePressed: (pressed: boolean) => void;
};

export const useGeneralStore = create<GeneralStore>((set) => ({
  isFilterActive: undefined,
  setFilterActive: (active) =>
    set((state) => ({...state, isFilterActive: active})),
  activeTab: 0,
  setActiveTab: (active) => set((state) => ({...state, activeTab: active})),
  timelinePressed: undefined,
  setTimelinePressed: (pressed) =>
    set((state) => ({...state, timelinePressed: pressed})),
}));

export default useGeneralStore;
