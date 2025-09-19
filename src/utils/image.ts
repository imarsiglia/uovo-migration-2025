import ImageCropPicker from 'react-native-image-crop-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { isAndroid } from './functions';
import { showToastMessage } from './toast';
import { ImageType } from '@generalTypes/general';

export const onLaunchCamera = async (
  closeModal: () => void,
  callback: (photo?: ImageType, path?: string) => void,
) => {
  let granted = true;
  if (isAndroid()) {
    granted = await requestWriteExternalStorage();
    if (granted) {
      granted = await requestCameraPermission();
    }
  }
  if (granted) {
    ImageCropPicker.openCamera({
      compressImageQuality: 0.5,
      includeBase64: true,
      writeTempFile: false,
      mediaType: 'photo',
      forceJpg: true,
    })
      .then((image) => {
        if (closeModal) {
          closeModal();
        }
        manageImage(image as ResponseImagePickerProps, callback);
      })
      .catch((error) =>
        showToastMessage(error?.message ?? 'Picture not captured'),
      );
  }
};

export const onSelectImage = async (
  closeModal: () => void,
  callback: (photo?: ImageType, path?: string) => void,
) => {
  let granted = true;
  if (isAndroid()) {
    granted = await requestReadMediaPermission();
  }
  try {
    ImageCropPicker.openPicker({
      mediaType: 'photo',
      includeBase64: true,
      writeTempFile: false,
      compressImageQuality: 0.5,
      forceJpg: true,
    })
      .then((image) => {
        closeModal();
        setTimeout(() => {
          manageImage(image as ResponseImagePickerProps, callback);
        }, 300);
      })
      .catch((error) =>
        showToastMessage(error?.message ?? 'Pictures not selected'),
      );
  } catch (e: any) {
    showToastMessage(e?.message ?? 'You must accept Read Media Permissions');
  }
};

type ResponseImagePickerProps = {
  didCancel: boolean;
  error: Error;
  customButton: any;
  data: string;
} & ImageType;

const manageImage = async (
  response: ImageType,
  callback?: (photo?: ImageType, imagePath?: string) => void,
) => {
  if (response.data && callback) {
    // var responseName = isAndroid()
    //   ? response.path
    //   : response.filename ?? response.path;
    // var tempExtension = responseName
    //   ?.substring(responseName?.lastIndexOf('.') + 1)
    //   ?.toLowerCase();
    callback(response, response.filename ?? response.path );
    // if (
    //   tempExtension != null &&
    //   (tempExtension.includes('jpg') ||
    //     tempExtension.includes('jpeg') ||
    //     tempExtension.includes('png'))
    // ) {
    //   var attached: any = {};
    //   let tempName = responseName?.substring(responseName.lastIndexOf('/') + 1);
    //   attached.name = tempName;
    //   attached.data = response.data;
    //   if (callback) {
    //     callback(attached, response.path);
    //   }
    // } else {
    //   Alert.alert('Error', 'Image not allowed');
    // }
  }
};

export const requestWriteExternalStorage = async () => {
  try {
    const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, {
      title: 'Write external storage',
      message: 'UOVO needs to write to external storage',
      //   @ts-ignore
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    if (
      granted === RESULTS.GRANTED ||
      granted === RESULTS.UNAVAILABLE ||
      granted === RESULTS.LIMITED
    ) {
      return true;
    }
  } catch (err) {
    console.warn(err);
  }
  return false;
};

export const requestCameraPermission = async () => {
  try {
    const granted = await request(PERMISSIONS.ANDROID.CAMERA, {
      title: 'App Camera Permission',
      message: 'UOVO needs access to your camera',
      //@ts-ignore
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    if (
      granted === RESULTS.GRANTED ||
      granted === RESULTS.UNAVAILABLE ||
      granted === RESULTS.LIMITED
    ) {
      return true;
    }
  } catch (err) {
    console.warn(err);
  }
  return false;
};

export const requestReadMediaPermission = async () => {
  try {
    //@ts-ignore
    const granted = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, {
      title: 'Read Media Permission',
      message: 'UOVO needs to read your media files',
      //@ts-ignore
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    if (
      granted === RESULTS.GRANTED ||
      granted === RESULTS.UNAVAILABLE ||
      granted === RESULTS.LIMITED
    ) {
      return true;
    }
  } catch (err) {
    console.warn(err);
  }
  return false;
};
