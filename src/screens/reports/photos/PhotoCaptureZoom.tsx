import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Camera from '../../components/conditionReport/Camera';
import { connect } from "react-redux";
import { compressImageDefault } from '../../utils/functions';

const PhotoCaptureZoom = React.memo(function PhotoCapture({
  navigation: { replace },
  route: {
    params: { note, refresh, refreshGallery, updateRefreshGallery, subType }
  },
  editModalFunction
}) {

  var showModal = true;

  useEffect(() => {
    return (() => {
      if (note && showModal) {
        editModalFunction();
      }

    })
  })

  const onCapture = useCallback(
    async ({ photo }) => {
      showModal = false;
      const base64Compressed = await compressImageDefault(photo.base64);
      photo.base64 = base64Compressed;
      replace('PhotoDetail', { photo, note, refresh: refresh, updateRefreshGallery: updateRefreshGallery, refreshGallery: refreshGallery, subType: subType });
    },
    [replace],
  );

  return (
    <View style={{ flex: 1 }}>
      <Camera onCapture={onCapture} />
    </View>
  );
});

const mapStateToProps = state => ({
  editModalFunction: state.editModalFunction,
});

export default connect(mapStateToProps)(PhotoCaptureZoom);
