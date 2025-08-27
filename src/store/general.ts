import { getFormattedDate } from '@utils/functions';
import {create} from 'zustand';

export type GeneralStore = {
  isFilterActive?: boolean;
  setFilterActive: (active: boolean) => void;
  activeTab?: number;
  setActiveTab: (tab: number) => void;
  timelinePressed?: boolean;
  setTimelinePressed: (pressed: boolean) => void;
  selectedDate?: string;
  setSelectedDate: (date: string) => void;
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
  selectedDate: getFormattedDate(new Date(), 'YYYY-MM-DD'),
  setSelectedDate: (date) => set((state) => ({...state, selectedDate: date})),
}));

export default useGeneralStore;
