import CameraScreenVC from '@components/condition/Camera';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {uriToBase64} from '@utils/image';
import {useCallback} from 'react';
import {View} from 'react-native';
import {PhotoFile} from 'react-native-vision-camera';

const PhotoCapture = () => {
  const {replaceScreen} = useCustomNavigation();

  const onCapture = useCallback(async ({photo}: {photo: PhotoFile}) => {
    const base64 = await uriToBase64(photo.path);
    replaceScreen(RoutesNavigation.ZoomScreen, {
      photo: {
        ...photo,
        uri: photo.path,
        base64: base64.replace(/\s+/g, ''),
        data: '',
      },
    });
  }, []);

  return (
    <View style={{flex: 1}}>
      <CameraScreenVC onCapture={onCapture} />
    </View>
  );
};

export default PhotoCapture;
