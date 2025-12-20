import {
  modalLoadingSetter,
  modalDialogSetter,
  ModalDialogContentType,
} from './modals';

export async function loadingWrapperPromise<T>(
  fnOrPromise: Promise<T> | (() => Promise<T>),
  opts?: {onError?: (e: any) => void},
) {
  modalLoadingSetter({loadingVisible: true});

  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  try {
    const res =
      typeof fnOrPromise === 'function'
        ? await fnOrPromise()
        : await fnOrPromise;
    return res;
  } catch (e) {
    opts?.onError?.(e);
    throw e;
  } finally {
    modalLoadingSetter({loadingVisible: false});
  }
}

// export async function loadingWrapperPromise<T>(
//   fnOrPromise: Promise<T> | (() => Promise<T>),
//   opts?: {onError?: (e: any) => void},
// ) {
//   modalLoadingSetter({loadingVisible: true});
//   try {
//     const res =
//       typeof fnOrPromise === 'function'
//         ? await (fnOrPromise as () => Promise<T>)()
//         : await fnOrPromise;
//     return res;
//   } catch (e) {
//     opts?.onError?.(e);
//     throw e;
//   } finally {
//     modalLoadingSetter({loadingVisible: false});
//   }
// }

export function openGeneralDialog(props: ModalDialogContentType) {
  modalDialogSetter(props);
}

export function closeGeneralDialog() {
  modalDialogSetter({
    modalVisible: false,
  });
}
