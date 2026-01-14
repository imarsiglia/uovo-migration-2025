import {isAndroid} from '@utils/functions';
import {requestCameraPermission} from '@utils/image';
import {showToastMessage} from '@utils/toast';
import {ImageType} from '@generalTypes/general';
import ImageCropPicker, {Options} from 'react-native-image-crop-picker';

export const useCamera = () => {
  const onLaunchCamera = async (
    closeModal: () => void,
    callback: (photo?: ImageType | ImageType[], path?: string) => void,
    options?: Options,
    onCancel?: () => void,
  ) => {
    let granted = true;
    if (isAndroid()) {
      granted = await requestCameraPermission();
      if (!granted) {
        showToastMessage('Camera permission not granted');
        throw new Error('Camera permission not granted');
      }
    }
    return ImageCropPicker.openCamera({
      compressImageQuality: 0.7,
      includeBase64: true,
      writeTempFile: false,
      mediaType: 'photo',
      forceJpg: true,
      ...options,
    })
      .then((image) => {
        closeModal?.();
        manageImage(image as any, callback);
        return image as ImageType | ImageType[];
      })
      .catch((error) => {
        if (isUserCancel(error) && onCancel) {
          onCancel();
        }
        showToastMessage(error?.message ?? 'Picture not captured');
      });
  };

  const isUserCancel = (error: any) => error?.code === 'E_PICKER_CANCELLED';

  const manageImage = async (
    response: ImageType | ImageType[],
    callback?: (photo?: ImageType | ImageType[], imagePath?: string) => void,
  ) => {
    if (!callback) return;
    if (Array.isArray(response)) {
      callback(response);
    } else {
      if (response.data) {
        callback(response, response.filename ?? response.path);
      } else {
        callback(response);
      }
    }
  };

  return {
    onLaunchCamera,
  };
};
