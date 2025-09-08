import {COLORS} from '@styles/colors';
import Toast from 'react-native-simple-toast';
import {StylesIOS} from 'react-native-simple-toast/lib/typescript/NativeSimpleToast';

export function showToastMessage(
  message: string,
  duration: number = Toast.SHORT,
  options?: StylesIOS,
) {
  Toast.show(message, duration, options);
}

export function showErrorToastMessage(
  message: string,
  duration: number = Toast.SHORT,
  options?: StylesIOS,
) {
  const finalOptions = options ?? {
    backgroundColor: COLORS.error,
    tapToDismissEnabled: true,
  };
  Toast.show(message, duration, finalOptions);
}

export function showToastMessageWithGravity(
  message: string,
  duration: number,
  gravity: number = Toast.BOTTOM,
  options?: StylesIOS,
) {
  Toast.showWithGravity(message, duration, gravity, options);
}
