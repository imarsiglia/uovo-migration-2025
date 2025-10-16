import React, { useCallback } from 'react';
import { View } from 'react-native';
import Camera from '../../components/conditionReport/Camera';
import { compressImageDefault } from '../../utils/functions';

const PhotoCaptureZoomEdit = React.memo(function PhotoCapture({
  navigation: { navigate, goBack},
  route: { params }
}) {
  const onCapture = useCallback(
    async ({ photo }) => {
      const base64Compressed = await compressImageDefault(photo.base64);
      params.updatePhoto(base64Compressed);
      goBack();
    },
    [navigate],
  );

  return (
    <View style={{ flex: 1 }}>
      <Camera onCapture={onCapture} />
    </View>
  );
});

export default PhotoCaptureZoomEdit;
