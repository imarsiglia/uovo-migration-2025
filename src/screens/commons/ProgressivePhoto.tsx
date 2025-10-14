// components/ProgressivePhoto.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated as RNAnimated, Image, Platform, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type {TaskPhotoType} from '@api/types/Task';
import {useFullPhotoUri} from '@api/hooks/HooksTaskServices';

type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';
const ensureDataUri = (s: string, type: ImageType) =>
  s?.startsWith('data:image/') ? s : `data:image/${type};base64,${s}`;

type Props = {
  photo: TaskPhotoType;
  /** para no gatillar fetch si el slide no está visible */
  visible?: boolean;
  /** tipo del preview base64 (el low-res) */
  type?: ImageType;
  /** cover/contain (resizeMode) */
  contentFit?: 'cover' | 'contain';
  /** estilos del contenedor */
  style?: any;
  /** blur al preview (iOS por defecto 2) */
  blurPreview?: number;
  /** duración del fade del high-res */
  fadeDurationMs?: number;
  /** versión (update_time del grupo) para invalidar caché de full-res */
  groupRev: string;

  /** ---- Zoom config opcional ---- */
  zoomEnabled?: boolean;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
  /** avisa al padre si hay zoom activo (para deshabilitar scroll del carrusel) */
  onZoomActiveChange?: (active: boolean) => void;
};

export const ProgressivePhoto: React.FC<Props> = ({
  photo,
  visible = true,
  type = 'jpeg',
  contentFit = 'contain',
  style,
  blurPreview = Platform.OS === 'ios' ? 2 : 0,
  fadeDurationMs = 220,
  groupRev,

  zoomEnabled = true,
  minScale = 1,
  maxScale = 4,
  doubleTapScale = 2.5,
  onZoomActiveChange,
}) => {
  // Preview (siempre base64 pequeño del item)
  const lowResUri = useMemo(() => ensureDataUri(photo.photo!, type), [photo.photo, type]);

  // URI final (file://) — ya sea desde servidor (id) o local (clientId)
  const {data: hiUri} = useFullPhotoUri(photo, {update_time: groupRev}, visible);

  // ---- Fade del high-res ----
  const hiOpacity = useRef(new RNAnimated.Value(0)).current;
  const [hiMounted, setHiMounted] = useState(false);
  const [hideLow, setHideLow] = useState(false);

  useEffect(() => {
    if (hiUri) setHiMounted(true);
  }, [hiUri]);

  const onHighLoad = () => {
    RNAnimated.timing(hiOpacity, {
      toValue: 1,
      duration: fadeDurationMs,
      useNativeDriver: true,
    }).start(() => setHideLow(true));
  };

  // ---- Zoom/Pan (Reanimated) ----
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  // Pan solo cuando hay zoom (estado JS para habilitar Pan gesture)
  const [panEnabled, setPanEnabled] = useState(false);

  // Reset de transformaciones cuando cambia la imagen/versión
  const depKey = useMemo(
    () =>
      `${photo.id ?? photo.clientId ?? 'noid'}:${groupRev ?? 'norev'}:${
        (photo.photo ?? '').slice(0, 32)
      }`,
    [photo.id, photo.clientId, photo.photo, groupRev],
  );

  useEffect(() => {
    // reset fade low/high
    hiOpacity.setValue(0);
    setHideLow(false);
    // reset transforms
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    setPanEnabled(false);
    onZoomActiveChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  // Notifica si hay zoom activo y conmuta panEnabled
  useDerivedValue(() => {
    const active = scale.value > 1.01;
    if (onZoomActiveChange) runOnJS(onZoomActiveChange)(active);
    runOnJS(setPanEnabled)(active);
  }, [scale]);

  const pinch = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      'worklet';
      // clamp inline (worklet-safe)
      const next = savedScale.value * e.scale;
      const clamped = next < minScale ? minScale : next > maxScale ? maxScale : next;
      scale.value = clamped;

      if (clamped <= 1.001) {
        translateX.value = 0;
        translateY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .enabled(zoomEnabled && panEnabled) // ⬅️ SOLO cuando hay zoom
    .minDistance(2)
    .onStart(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      if (scale.value <= 1.02) return;
      translateX.value = savedTX.value + e.translationX;
      translateY.value = savedTY.value + e.translationY;
    });

  const doubleTap = Gesture.Tap()
    .enabled(zoomEnabled)
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      const goingIn = scale.value <= 1.01;
      const target = goingIn ? doubleTapScale : 1;
      scale.value = withTiming(target, {duration: 160});
      translateX.value = withTiming(0, {duration: 160});
      translateY.value = withTiming(0, {duration: 160});
      // panEnabled se actualiza solo vía useDerivedValue
    });

  const gestures = Gesture.Simultaneous(pinch, pan, doubleTap);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <View style={[styles.container, style]}>
      <GestureDetector gesture={gestures}>
        <Reanimated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
          {/* Preview low-res (debajo) */}
          {!hideLow && (
            <Image
              source={{uri: lowResUri}}
              resizeMode={contentFit}
              style={styles.absoluteImg}
              blurRadius={blurPreview}
              {...(Platform.OS === 'android' ? ({fadeDuration: 0} as any) : {})}
            />
          )}

          {/* High-res (encima) con fade */}
          {hiMounted && hiUri && (
            <RNAnimated.Image
              source={{uri: hiUri}}
              resizeMode={contentFit}
              onLoad={onHighLoad}
              style={[styles.absoluteImg, {opacity: hiOpacity}]}
              {...(Platform.OS === 'android' ? ({fadeDuration: 0} as any) : {})}
            />
          )}
        </Reanimated.View>
      </GestureDetector>
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
