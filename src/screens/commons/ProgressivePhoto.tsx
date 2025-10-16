// components/ProgressivePhoto.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated as RNAnimated,
  Image,
  Platform,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from 'react-native';
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
  /** reducida para evitar falsos positivos al arrastrar */
  doubleTapMaxDelayMs?: number;
  /** avisa al padre si hay zoom activo (para deshabilitar scroll del carrusel) */
  onZoomActiveChange?: (active: boolean) => void;

  /**
   * (Opcional) Referencia externa para permitir gestos simultáneos con el carrusel
   * (FlatList/ScrollView). Pasar el ref del FlatList si quieres máxima fluidez.
   */
  externalScrollRef?: any;
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
  doubleTapMaxDelayMs = 180,
  onZoomActiveChange,
  externalScrollRef,
}) => {
  // Preview (siempre base64 pequeño del item)
  const lowResUri = useMemo(
    () => ensureDataUri(photo.photo!, type),
    [photo.photo, type],
  );

  // URI final (file://) — ya sea desde servidor (id) o local (clientId)
  const {data: hiUri} = useFullPhotoUri(
    photo,
    {update_time: groupRev},
    visible,
  );

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

  // ---- Layout del contenedor (para clamps) ----
  const containerW = useSharedValue(0);
  const containerH = useSharedValue(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    containerW.value = width;
    containerH.value = height;
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
      `${photo.id ?? photo.clientId ?? 'noid'}:${groupRev ?? 'norev'}:${(
        photo.photo ?? ''
      ).slice(0, 32)}`,
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

  // Helpers worklet
  const clamp = (v: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(v, min), max);
  };
  const bounds = (s: number) => {
    'worklet';
    // Aproximación: imagen ocupa el contenedor en "contain";
    // este bound es seguro y evita arrastrar fuera de la pantalla.
    const maxX = Math.max(0, ((containerW.value * s) - containerW.value) / 2);
    const maxY = Math.max(0, ((containerH.value * s) - containerH.value) / 2);
    return {maxX, maxY};
  };

  // Notifica si hay zoom activo y conmuta panEnabled
  useDerivedValue(() => {
    const active = scale.value > 1.01;
    if (onZoomActiveChange) runOnJS(onZoomActiveChange)(active);
    runOnJS(setPanEnabled)(active);
  }, [scale]);

  // Pinch
  const pinch = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onStart(() => {
      savedScale.value = scale.value;
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      // clamp scale
      const next = savedScale.value * e.scale;
      const clamped =
        next < minScale ? minScale : next > maxScale ? maxScale : next;
      scale.value = clamped;

      if (clamped <= 1.001) {
        translateX.value = 0;
        translateY.value = 0;
      } else {
        // Mantener dentro de límites al “apretar/soltar”
        const b = bounds(clamped);
        translateX.value = clamp(translateX.value, -b.maxX, b.maxX);
        translateY.value = clamp(translateY.value, -b.maxY, b.maxY);
      }
    })
    .onEnd(() => {
      'worklet';
      // Snap a 1 si quedó casi en 1 → ayuda a reactivar swipe del carrusel
      if (scale.value < 1.02) {
        scale.value = withTiming(1, {duration: 120});
        translateX.value = withTiming(0, {duration: 120});
        translateY.value = withTiming(0, {duration: 120});
      } else {
        // Asegurar que no quede fuera de límites
        const b = bounds(scale.value);
        translateX.value = withTiming(
          clamp(translateX.value, -b.maxX, b.maxX),
          {duration: 120},
        );
        translateY.value = withTiming(
          clamp(translateY.value, -b.maxY, b.maxY),
          {duration: 120},
        );
      }
    });

  if (externalScrollRef) {
    pinch.simultaneousWithExternalGesture(externalScrollRef);
  }

  // Pan
  const pan = Gesture.Pan()
    .enabled(zoomEnabled && panEnabled) // SOLO cuando hay zoom
    .minDistance(2)
    .onStart(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      if (scale.value <= 1.02) return;
      const b = bounds(scale.value);
      translateX.value = clamp(savedTX.value + e.translationX, -b.maxX, b.maxX);
      translateY.value = clamp(savedTY.value + e.translationY, -b.maxY, b.maxY);
    });

  if (externalScrollRef) {
    pan.simultaneousWithExternalGesture(externalScrollRef);
  }

  // Double tap (rápido y con poca tolerancia de arrastre)
  const doubleTap = Gesture.Tap()
    .enabled(zoomEnabled)
    .numberOfTaps(2)
    .maxDelay(doubleTapMaxDelayMs)
    .maxDeltaX(10)
    .maxDeltaY(10)
    .onEnd((e, success) => {
      'worklet';
      if (!success) return;

      const goingIn = scale.value <= 1.01;
      const target = goingIn ? doubleTapScale : 1;

      if (target === 1) {
        // reset total → ayuda al carrusel a recuperar el swipe
        scale.value = withTiming(1, {duration: 160});
        translateX.value = withTiming(0, {duration: 160});
        translateY.value = withTiming(0, {duration: 160});
        return;
      }

      // Zoom al punto tocado (mejor UX)
      const factor = target / scale.value;
      const cx = containerW.value / 2;
      const cy = containerH.value / 2;
      const dx = e.x - cx;
      const dy = e.y - cy;

      const nextTX = translateX.value - dx * (factor - 1);
      const nextTY = translateY.value - dy * (factor - 1);
      const b = bounds(target);

      scale.value = withTiming(target, {duration: 160});
      translateX.value = withTiming(clamp(nextTX, -b.maxX, b.maxX), {
        duration: 160,
      });
      translateY.value = withTiming(clamp(nextTY, -b.maxY, b.maxY), {
        duration: 160,
      });
      // panEnabled se actualiza vía useDerivedValue
    });

  if (externalScrollRef) {
    doubleTap.simultaneousWithExternalGesture(externalScrollRef);
  }

  const gestures = Gesture.Simultaneous(pinch, pan, doubleTap);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
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
            source={{uri: `data:image/jpeg;base64,${hiUri}`}}
            resizeMode={contentFit}
            onLoad={onHighLoad}
            style={[styles.absoluteImg, {opacity: hiOpacity}]}
            {...(Platform.OS === 'android' ? ({fadeDuration: 0} as any) : {})}
          />
        )}
      </Reanimated.View>

      {/* Detector de gestos encima (envolviendo toda el área touch) */}
      <GestureDetector gesture={gestures}>
        <View style={StyleSheet.absoluteFill} />
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
