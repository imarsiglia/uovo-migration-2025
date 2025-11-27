import React, {useCallback} from 'react';
import {View} from 'react-native';
import CameraScreenVC from '@components/condition/Camera';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {uriToBase64} from '@utils/image';
import {PhotoFile} from 'react-native-vision-camera';

const PhotoCaptureZoomEdit = () => {
  const {navigate, replaceScreen, goBackAndUpdate, goBackToIndex} =
    useCustomNavigation();

  const onCapture = useCallback(async ({photo}: {photo: PhotoFile}) => {
    const base64 = await uriToBase64(photo.path);
    navigate(
      RoutesNavigation.PhotoDetailCondition,
      {editedImage: base64},
      {
        merge: true,
        pop: true,
      },
    );
  }, []);

  return (
    <View style={{flex: 1}}>
      <CameraScreenVC onCapture={onCapture} />
    </View>
  );
};

export default PhotoCaptureZoomEdit;
