import React, {useCallback} from 'react';
import {View} from 'react-native';
import CameraScreenVC from '@components/condition/Camera';

const PhotoCaptureZoomEdit = React.memo(function PhotoCapture({
  navigation: {navigate, goBack},
  route: {params},
}: any) {
  const onCapture = useCallback(
    async ({photo}: any) => {
      // const base64Compressed = await compressImageDefault(photo.base64);
      params.updatePhoto(photo.base64);
      goBack();
    },
    [navigate],
  );

  return (
    <View style={{flex: 1}}>
      <CameraScreenVC onCapture={onCapture} />
    </View>
  );
});

export default PhotoCaptureZoomEdit;
