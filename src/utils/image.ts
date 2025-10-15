import ImageCropPicker, {Options} from 'react-native-image-crop-picker';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {isAndroid} from './functions';
import {showToastMessage} from './toast';
import {ImageType} from '@generalTypes/general';
import {Skia, ImageFormat as SkiaImageFormat} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

const PHOTO_DIR = `${RNFS.CachesDirectoryPath}/photos`;

export const onLaunchCamera = async (
  closeModal: () => void,
  callback: (photo?: ImageType | ImageType[], path?: string) => void,
  options?: Options,
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
      ...options,
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
  callback: (photo?: ImageType | ImageType[], path?: string) => void,
  options?: Options,
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
      ...options,
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

export function flattenBase64OnWhite(
  base64: string,
  outFormat: 'png' | 'jpeg' = 'png',
  quality: number = 1,
): string | undefined {
  // 1) Decodificar
  const data = Skia.Data.fromBase64(base64);
  const img = Skia.Image.MakeImageFromEncoded(data);
  if (!img) return base64; // fallback: si no se pudo decodificar

  // 2) Crear surface destino
  const surface = Skia.Surface.MakeOffscreen(img.width(), img.height());
  if (!surface) {
    return undefined;
  }
  const canvas = surface.getCanvas();

  // 3) Pintar fondo blanco y luego la imagen
  //    (clear con blanco asegura que no quede alfa)
  const white = Skia.Color('white');
  canvas.clear(white);
  canvas.drawImage(img, 0, 0);

  // 4) Snapshot + encode
  const snapshot = surface?.makeImageSnapshot();
  const fmt = outFormat === 'jpeg' ? SkiaImageFormat.JPEG : SkiaImageFormat.PNG;
  const outBase64 = snapshot.encodeToBase64(fmt, Math.round(quality * 100));
  return outBase64;
}

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
