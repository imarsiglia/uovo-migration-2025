import { ImageType } from '@generalTypes/general';
import RNFS from 'react-native-fs';
import ImageCropPicker, { Options } from 'react-native-image-crop-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { PhotoFile } from 'react-native-vision-camera';
import { isAndroid } from './functions';
import { showToastMessage } from './toast';

const PHOTO_DIR = `${RNFS.CachesDirectoryPath}/photos`;

export const onLaunchCamera = async (
  closeModal: () => void,
  callback: (photo?: ImageType | ImageType[], path?: string) => void,
  options?: Options,
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
    compressImageQuality: 0.5,
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
    .catch((error) =>
      showToastMessage(error?.message ?? 'Picture not captured'),
    );
};

export const onSelectImage = async (
  closeModal: () => void,
  callback: (photo?: ImageType | ImageType[], path?: string) => void,
  options?: Options,
) => {
  let granted = true;
  if (isAndroid()) {
    granted = await requestReadMediaPermission();
  }
  if (!granted) throw new Error('Read media permission not granted');

  return ImageCropPicker.openPicker({
    mediaType: 'photo',
    includeBase64: true,
    writeTempFile: false,
    compressImageQuality: 0.5,
    forceJpg: true,
    waitAnimationEnd: false,
    ...options,
  })
    .then((image) => {
      closeModal?.();
      manageImage(image as any, callback);
      return image as ImageType | ImageType[];
    })
    .catch((error) => {
      showToastMessage(error?.message ?? 'Picture not selected');
    });
};

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

type ConvertImageOptions = {
  /** Si true, devuelve "data:<mime>;base64,<b64>" */
  withDataUri?: boolean;
  /** Mime a usar en el data URI (por defecto image/jpeg) */
  mime?: string;
};

/**
 * Convierte una imagen local (file://, content://, ph://) a base64.
 * @returns base64 (con o sin data URI, según withDataUri)
 */
export async function uriToBase64(
  uri: string,
  {withDataUri = false, mime = 'image/jpeg'}: ConvertImageOptions = {},
): Promise<string> {
  let path = uri;

  try {
    // Quitar el prefijo file:// para RNFS.readFile
    if (path.startsWith('file://')) {
      path = path.replace('file://', '');
    }

    // ANDROID: content:// (muchas veces RNFS.readFile ya lo soporta)
    // Si tu versión de RNFS no soporta content://, considera usar react-native-blob-util como fallback.
    const b64 = await RNFS.readFile(path, 'base64');

    if (withDataUri) {
      return `data:${mime};base64,${b64}`;
    }
    return b64;
  } finally {
  }
}

type UriBase64 = {uri: string; base64: string};

export async function photoFileToUriBase64(
  photo: PhotoFile,
): Promise<UriBase64> {
  if (!photo.path) {
    throw new Error('PhotoFile no tiene path');
  }

  // VisionCamera guarda algo tipo: /data/user/0/tu.app/cache/mrousavy123.jpg
  // Para <Image /> casi siempre necesitas el prefijo file://
  const filePath = photo.path.startsWith('file://')
    ? photo.path.replace('file://', '')
    : photo.path;

  const uri = `file://${filePath}`;

  // RNFS.readFile espera la ruta sin file://
  const base64 = await RNFS.readFile(filePath, 'base64');

  return {uri, base64};
}

export const getFileExtension = (filePath: string): string => {
  const lastDotIndex = filePath.lastIndexOf('.');

  // Si no hay punto o está al final, retornar vacío
  if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
    return '';
  }

  // Retornar extensión incluyendo el punto
  return filePath.substring(lastDotIndex);
};
