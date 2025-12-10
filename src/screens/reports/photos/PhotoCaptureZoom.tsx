import CameraScreenVC from '@components/condition/Camera';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {uriToBase64} from '@utils/image';
import {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {PhotoFile} from 'react-native-vision-camera';

const PhotoCaptureZoom = () => {
  const {replaceScreen} = useCustomNavigation();

  const onCapture = useCallback(async ({photo}: {photo: PhotoFile}) => {
    const base64 = await uriToBase64(photo.path);
    replaceScreen(RoutesNavigation.PhotoDetailCondition, {
      photo: base64,
    });
  }, []);

  return (
    <View style={{flex: 1}}>
      <CameraScreenVC onCapture={onCapture} />
    </View>
  );
};
export default PhotoCaptureZoom;
