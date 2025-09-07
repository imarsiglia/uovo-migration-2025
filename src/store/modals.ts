import {ReactNode} from 'react';
import {create} from 'zustand';

type ModalDialogContentType = {
  modalVisible: boolean;
  type?: 'info' | 'error' | 'success' | 'warning';
  message?: string | ReactNode;
  title?: string;
  confirmBtnLabel?: string;
  cancelBtnLabel?: string;
  onConfirm?: () => void;
  modalProps?: {
    showCloseIcon?: boolean | undefined;
  };
  onCancel?: () => void;
  cancelable?: boolean;
};
type ModalDialogType = ModalDialogContentType & {
  showVisible: (info: ModalDialogContentType) => void;
};

export const useModalDialogStore = create<ModalDialogType>((set) => ({
  modalVisible: false,
  type: 'info',
  message: undefined,
  title: '',
  confirmBtnLabel: undefined,
  cancelBtnLabel: undefined,
  modalProps: undefined,
  cancelable: true,
  onConfirm: () => {},
  onCancel: () => {},
  showVisible: (info) =>
    set((state) => ({
      ...state,
      modalVisible: info.modalVisible,
      type: info.type ?? 'info',
      message: info.message ?? 'Are you sure you want to continue?',
      title: info.title,
      onConfirm: info.onConfirm,
      confirmBtnLabel: info.confirmBtnLabel ?? 'Confirm',
      cancelBtnLabel: info.cancelBtnLabel ?? 'Cancel',
      modalProps: info.modalProps,
      onCancel: info.onCancel,
      cancelable: info.cancelable,
    })),
}));

export const modalDialogGetter = useModalDialogStore.getState;
export const modalDialogSetter = useModalDialogStore.setState;

export const useModalLoadingStore = create<{
  loadingVisible: boolean;
  showLoading: (value: boolean) => void;
}>((set) => ({
  loadingVisible: false,
  showLoading: (value: boolean) => set(() => ({loadingVisible: value})),
}));

export const modalLoadingGetter = useModalLoadingStore.getState;
export const modalLoadingSetter = useModalLoadingStore.setState;
