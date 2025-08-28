import {JOBQUEUE_STATUS} from '@api/contants/constants';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {zustandMMKVStorage} from '../storage/mmkv';

type JobQueueState = {
  serviceLocation?: string[];
  orderBy: string;
  STATUS?: string;
  WOTYPE?: string;
  CLIENT?: string;
  START_DATE?: string;
  WO_NUMBER?: string;
  setServiceLocation: (value: string[]) => void;
  setOrderBy: (value: string) => void;
  setStatus: (value: string) => void;
  setWoType: (value: string) => void;
  setClient: (value: string) => void;
  setStartDate: (value: string) => void;
  setWoNumber: (value: string) => void;
  onChangeValueByType: (value: string, type: string) => void;
  getValueByType: (type: string) => string | undefined;
};

export const useJobQueueStore = create<JobQueueState>()(
  persist(
    (set, get) => ({
      serviceLocation: [],
      orderBy: JOBQUEUE_STATUS,
      STATUS: undefined,
      WOTYPE: undefined,
      CLIENT: undefined,
      START_DATE: undefined,
      WO_NUMBER: undefined,
      setServiceLocation: (value) =>
        set((state) => ({...state, serviceLocation: value})),
      setOrderBy: (value) => set((state) => ({...state, orderBy: value})),
      setStatus: (value) => set((state) => ({...state, STATUS: value})),
      setWoType: (value) => set((state) => ({...state, WOTYPE: value})),
      setClient: (value) => set((state) => ({...state, CLIENT: value})),
      setStartDate: (value) => set((state) => ({...state, START_DATE: value})),
      setWoNumber: (value) => set((state) => ({...state, WO_NUMBER: value})),
      onChangeValueByType: (value, type) =>
        set((state) => ({...state, [type]: value})),
      getValueByType: (type) =>
        get()[type as keyof JobQueueState] as string | undefined,
    }),
    {
      name: 'jobqueue', // clave en MMKV
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({
        WOTYPE: s.WOTYPE,
        CLIENT: s.CLIENT,
        START_DATE: s.START_DATE,
        WO_NUMBER: s.WO_NUMBER,
        orderBy: s.orderBy,
        serviceLocation: s.serviceLocation,
      }),
      // control de versiones/migraciones por si cambias el shape
      version: 4,
      // migrate: async (persisted, version) => persisted as any,
    },
  ),
);
