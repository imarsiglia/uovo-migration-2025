import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import RNAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import type {TaskPhotoType} from '@api/types/Task';
import {useFullPhotoUri} from '@api/hooks/HooksTaskServices';

type ImageType = 'jpeg' | 'png' | 'webp' | 'gif';

const ensureDataUri = (s: string, type: ImageType) =>
  s?.startsWith('data:image/') ? s : `data:image/${type};base64,${s}`;

type Props = {
  photo: TaskPhotoType;
  visible?: boolean;
  type?: ImageType;
  contentFit?: 'cover' | 'contain';
  style?: any;
  blurPreview?: number;
  fadeDurationMs?: number;
  groupRev: string;
  zoomEnabled?: boolean;
  onZoomActiveChange?: (active: boolean) => void;
};

export const ProgressivePhoto: React.FC<Props> = ({
  photo,
  visible = true,
  type = 'jpeg',
  contentFit = 'contain',
  style,
  blurPreview = Platform.OS === 'ios' ? 2 : 0,
  fadeDurationMs = 300,
  groupRev,
  zoomEnabled = true,
  onZoomActiveChange,
}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();

  // Preview (base64 pequeño)
  const lowResUri = useMemo(
    () => ensureDataUri(photo.photo!, type),
    [photo.photo, type],
  );

  const photoKey = useMemo(
    () =>
      `${photo.id ?? photo.clientId ?? 'unknown'}-${groupRev}-${
        photo.photo?.length ?? 0
      }`,
    [photo.id, photo.clientId, groupRev, photo.photo],
  );

  // URI de alta calidad
  const {data: hiUri} = useFullPhotoUri(
    photo,
    {update_time: photoKey},
    visible,
  );

  // Estados para el fade
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [showLowRes, setShowLowRes] = useState(true);
  const [isPanEnabled, setIsPanEnabled] = useState(false);

  // Key única para forzar re-render cuando cambia la foto
  // const photoKey = useMemo(
  //   () => `${photo.id ?? photo.clientId ?? 'unknown'}-${groupRev}`,
  //   [photo.id, photo.clientId, groupRev],
  // );

  // Zoom/Pan con Reanimated
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Reset cuando cambia la foto
  useEffect(() => {
    setHighResLoaded(false);
    setShowLowRes(true);
    setIsPanEnabled(false);
    fadeAnim.setValue(0);
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    onZoomActiveChange?.(false);
  }, [photoKey]);

  // Manejar carga de imagen de alta calidad
  const handleHighResLoad = () => {
    setHighResLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeDurationMs,
      useNativeDriver: true,
    }).start(() => {
      setShowLowRes(false);
    });
  };

  // URI completa de alta calidad
  const highResUri = useMemo(() => {
    if (!hiUri) return null;
    return hiUri.startsWith('data:')
      ? hiUri
      : `data:image/jpeg;base64,${hiUri}`;
  }, [hiUri]);

  // Notificar cambio de zoom
  const notifyZoomChange = (isZoomed: boolean) => {
    setIsPanEnabled(isZoomed);
    onZoomActiveChange?.(isZoomed);
  };

  // Helper para calcular límites
  const clamp = (value: number, min: number, max: number) => {
    'worklet';
    return Math.max(min, Math.min(value, max));
  };

  const getBounds = (currentScale: number) => {
    'worklet';
    const maxX = Math.max(0, (screenWidth * (currentScale - 1)) / 2);
    const maxY = Math.max(0, (screenHeight * (currentScale - 1)) / 2);
    return {maxX, maxY};
  };

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = clamp(newScale, 1, 4);
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withSpring(1, {damping: 15});
        translateX.value = withSpring(0, {damping: 15});
        translateY.value = withSpring(0, {damping: 15});
        runOnJS(notifyZoomChange)(false);
      } else {
        const bounds = getBounds(scale.value);
        translateX.value = withSpring(
          clamp(translateX.value, -bounds.maxX, bounds.maxX),
          {damping: 15},
        );
        translateY.value = withSpring(
          clamp(translateY.value, -bounds.maxY, bounds.maxY),
          {damping: 15},
        );
        runOnJS(notifyZoomChange)(true);
      }
    });

  // Pan gesture - SOLO activo cuando hay zoom (controlado por estado)
  const panGesture = Gesture.Pan()
    .enabled(zoomEnabled && isPanEnabled)
    .minDistance(5)
    .maxPointers(1)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      const bounds = getBounds(scale.value);
      translateX.value = clamp(
        savedTranslateX.value + e.translationX,
        -bounds.maxX,
        bounds.maxX,
      );
      translateY.value = clamp(
        savedTranslateY.value + e.translationY,
        -bounds.maxY,
        bounds.maxY,
      );
    });

  // Double tap gesture
  const doubleTapGesture = Gesture.Tap()
    .enabled(zoomEnabled)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e) => {
      if (scale.value > 1.05) {
        // Zoom out
        scale.value = withTiming(1, {duration: 250});
        translateX.value = withTiming(0, {duration: 250});
        translateY.value = withTiming(0, {duration: 250});
        runOnJS(notifyZoomChange)(false);
      } else {
        // Zoom in al punto tocado
        const targetScale = 2.5;

        // Calcular offset para centrar en el punto tocado
        const tapX = e.x - screenWidth / 2;
        const tapY = e.y - screenHeight / 2;

        const bounds = getBounds(targetScale);
        const newTranslateX = clamp(
          -tapX * (targetScale - 1),
          -bounds.maxX,
          bounds.maxX,
        );
        const newTranslateY = clamp(
          -tapY * (targetScale - 1),
          -bounds.maxY,
          bounds.maxY,
        );

        scale.value = withTiming(targetScale, {duration: 250});
        translateX.value = withTiming(newTranslateX, {duration: 250});
        translateY.value = withTiming(newTranslateY, {duration: 250});

        runOnJS(notifyZoomChange)(true);
      }
    });

  // Combinar gestos
  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <View style={[styles.container, style]}>
      <GestureDetector gesture={composedGesture}>
        <RNAnimated.View style={[styles.imageContainer, animatedStyle]}>
          {/* Preview low-res */}
          {showLowRes && (
            <Image
              key={`${photoKey}-low`}
              source={{uri: lowResUri}}
              style={[styles.image, {width: screenWidth, height: screenHeight}]}
              resizeMode={contentFit}
              blurRadius={blurPreview}
            />
          )}

          {/* High-res con fade */}
          {highResUri && (
            <Animated.Image
              key={`${photoKey}-high`}
              source={{uri: highResUri}}
              style={[
                styles.image,
                {
                  width: screenWidth,
                  height: screenHeight,
                  opacity: fadeAnim,
                },
              ]}
              resizeMode={contentFit}
              onLoad={handleHighResLoad}
            />
          )}
        </RNAnimated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
  },
});
