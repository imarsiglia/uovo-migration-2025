// stores/callSheetStore.ts
import {create} from 'zustand';

type CallSheetState = {
  isOpen: boolean;
  phone?: string | null;
  open: (phone: string) => void;
  close: () => void;
  setPhone: (phone?: string | null) => void;
};

export const useCallSheetStore = create<CallSheetState>((set) => ({
  isOpen: false,
  phone: null,
  open: (phone: string) => set({ isOpen: true, phone }),
  close: () => set({ isOpen: false, phone: null }),
  setPhone: (phone?: string | null) => set({ phone }),
}));

// convenience functions (optional)
export const openCallSheet = (phone: string) => {
  useCallSheetStore.getState().open(phone);
};
export const closeCallSheet = () => {
  useCallSheetStore.getState().close();
};
