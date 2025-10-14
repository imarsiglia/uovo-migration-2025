// components/ProgressivePhoto.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Image, Platform, StyleSheet, View} from 'react-native';
import type {TaskPhotoType} from '@api/types/Task';
import {useGetPhotoUri} from '@api/hooks/HooksTaskServices';

type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';
const ensureDataUri = (s: string, type: ImageType) =>
  s?.startsWith('data:image/') ? s : `data:image/${type};base64,${s}`;

export const ProgressivePhoto = ({
  photo,
  visible = true,
  type = 'jpeg',
  contentFit = 'contain',
  style,
  blurPreview = Platform.OS === 'ios' ? 2 : 0,
  fadeDurationMs = 220,
}: {
  photo: TaskPhotoType;
  visible?: boolean;
  type?: ImageType;
  contentFit?: 'cover' | 'contain';
  style?: any;
  blurPreview?: number;
  fadeDurationMs?: number;
}) => {
  // Preview (siempre base64 pequeño del item)
  const lowResUri = useMemo(
    () => ensureDataUri(photo.photo!, type),
    [photo.photo, type],
  );

  // URI final (file://) — ya sea desde servidor (id) o local (clientId)
  const {data: finalUri} = useGetPhotoUri(photo, visible);

  const hiOpacity = useRef(new Animated.Value(0)).current;
  const [hiMounted, setHiMounted] = useState(false);
  const [hideLow, setHideLow] = useState(false);

  useEffect(() => {
    if (finalUri) setHiMounted(true);
  }, [finalUri]);

  const onHighLoad = () => {
    Animated.timing(hiOpacity, {
      toValue: 1,
      duration: fadeDurationMs,
      useNativeDriver: true,
    }).start(() => setHideLow(true));
  };

  return (
    <View style={[styles.container, style]}>
      {!hideLow && (
        <Image
          source={{uri: lowResUri}}
          resizeMode={contentFit}
          style={styles.absoluteImg}
          blurRadius={blurPreview}
          {...(Platform.OS === 'android' ? ({fadeDuration: 0} as any) : {})}
        />
      )}

      {hiMounted && finalUri && (
        <Animated.Image
          source={{uri: finalUri}} // file://
          resizeMode={contentFit}
          onLoad={onHighLoad}
          style={[styles.absoluteImg, {opacity: hiOpacity}]}
          {...(Platform.OS === 'android' ? ({fadeDuration: 0} as any) : {})}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {width: '100%', height: '100%', backgroundColor: 'black'},
  absoluteImg: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
});
