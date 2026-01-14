import {create} from 'zustand';

type CameraTriggerStore = {
  shouldOpen: boolean;
  open: () => void;
  clear: () => void;
};

export const useCameraTrigger = create<CameraTriggerStore>((set, get) => ({
  shouldOpen: false,
  open: () =>
    set((state) => ({
      ...state,
      shouldOpen: true,
    })),
  clear: () =>
    set((state) => ({
      ...state,
      shouldOpen: false,
    })),
}));
