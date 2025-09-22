import {
  modalLoadingSetter,
  modalDialogSetter,
  ModalDialogContentType,
} from './modals';

export async function loadingWrapperPromise<T>(promise: Promise<T>) {
  modalLoadingSetter({loadingVisible: true});
  const res = await promise;
  modalLoadingSetter({loadingVisible: false});
  return res;
}

export function openGeneralDialog(props: ModalDialogContentType) {
  modalDialogSetter(props);
}

export function closeGeneralDialog() {
  modalDialogSetter({
    modalVisible: false,
  });
}
