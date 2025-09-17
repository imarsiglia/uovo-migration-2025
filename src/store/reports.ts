import { ReportResumeType } from '@api/types/Inventory';
import { create } from 'zustand';

export type ReportStore = {
  conditionReportList?: ReportResumeType[];
  setConditionReportList: (val: ReportResumeType[]) => void;
  conditionCheckList?: ReportResumeType[];
  setConditionCheckList: (val: ReportResumeType[]) => void;
};

export const useReportStore = create<ReportStore>((set) => ({
  conditionReportList: [],
  setConditionReportList: (val) =>
    set((state) => ({...state, conditionReportList: val})),
  conditionCheckList: [],
  setConditionCheckList: (val) =>
    set((state) => ({...state, conditionCheckList: val})),
}));

export default useReportStore;
