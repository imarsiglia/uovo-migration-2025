// CameraScreenVC.tsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Icon from 'react-native-fontawesome-pro';

// 👇 Reanimated + Gesture Handler
import Reanimated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

// Habilitamos el prop nativo `zoom` para animarlo con Reanimated
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

// Versión animada de Camera
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

type Props = {onCapture: (payload: {photo: PhotoFile}) => void};

const CameraScreenVC: React.FC<Props> = ({onCapture}) => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const {hasPermission, requestPermission} = useCameraPermission();
  const [torch, setTorch] = useState<'off' | 'on'>('off');

  // 🔍 Zoom controlado por gestos (Pinch)
  const zoom = useSharedValue(1);
  const zoomOffset = useSharedValue(1);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // Cuando ya tenemos device, inicializamos el zoom en neutral
  useEffect(() => {
    if (device) {
      zoom.value = device.neutralZoom;
      zoomOffset.value = device.neutralZoom;
    }
  }, [device, zoom, zoomOffset]);

  const toggleTorch = useCallback(() => {
    setTorch((t) => (t === 'on' ? 'off' : 'on'));
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePhoto({
      flash: torch === 'on' ? 'on' : 'off',
    });
    onCapture?.({photo});
  }, [onCapture, torch]);

  // 🔍 TAP TO FOCUS usando Vision Camera + Gesture Handler
  const focusAtPoint = useCallback(
    async ({x, y}: {x: number; y: number}) => {
      const cam = cameraRef.current;
      if (!cam) {
        return;
      }
      if (!device?.supportsFocus) {
        // Algunos dispositivos no soportan focus manual
        return;
      }

      try {
        await cam.focus({x, y});
      } catch (e) {
        console.warn('Error al enfocar en punto tocado:', e);
      }
    },
    [device],
  );

  // 👆 Gesture de tap: donde toques, enfocamos
  const tapGesture = Gesture.Tap().onEnd(({x, y}) => {
    // Pasamos el evento al hilo JS
    runOnJS(focusAtPoint)({x, y});
  });

  // 🤏 Gesture de pinch: zoom in / zoom out
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value;
    })
    .onUpdate((event) => {
      if (!device) {
        return;
      }
      // Ajustamos el zoom en base a la escala del pinch
      const z = zoomOffset.value * event.scale;

      zoom.value = interpolate(
        z,
        [1, 10], // rango "virtual" de gesto
        [device.minZoom, 10], // rango real soportado por la cámara
        Extrapolation.CLAMP,
      );
    });

  // Combinamos tap + pinch simultáneamente
  const combinedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

  // Mapeamos el shared value de zoom al prop nativo `zoom` de la cámara
  const animatedProps = useAnimatedProps(() => ({
    zoom: zoom.value,
  }));

  if (device == null) {
    return <View style={{flex: 1, backgroundColor: 'black'}} />;
  }

  return (
    <View style={styles.container}>
      {/* 👇 GestureDetector envolviendo SOLO el área de la cámara */}
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.cameraContainer}>
          <ReanimatedCamera
            ref={cameraRef}
            style={styles.preview}
            device={device}
            isActive
            photo
            torch={torch}
            // Desactivamos el zoom nativo para usar nuestro pinch custom
            enableZoomGesture={false}
            animatedProps={animatedProps}
          />
          {/* Overlay de cuadrícula (no bloquea los gestos) */}
          <View style={styles.grid}>
            <View style={styles.row}>
              <View style={styles.gridSqr} />
              <View style={styles.gridSqr} />
              <View style={styles.gridSqr} />
            </View>
            <View style={styles.row}>
              <View style={styles.gridSqr} />
              <View style={styles.gridSqr} />
              <View style={styles.gridSqr} />
            </View>
            <View style={styles.row}>
              <View style={styles.gridSqr} />
              <View style={styles.gridSqr} />
              <View style={styles.gridSqr} />
            </View>
          </View>
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Text style={styles.photoText}>PHOTO</Text>
        <View style={[styles.row, styles.separated]}>
          <TouchableOpacity onPress={toggleTorch} style={styles.flash}>
            <View>
              <Icon
                name="bolt"
                type={torch === 'off' ? 'light' : 'solid'}
                size={30}
                color={torch === 'off' ? '#d0d0d0' : 'white'}
              />
              {torch === 'off' && (
                <Icon
                  iconStyle={{position: 'absolute'}}
                  name="slash"
                  type="solid"
                  size={30}
                  color="#d0d0d0"
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture} style={styles.capture}>
            <View style={styles.buttonInner} />
          </TouchableOpacity>

          <View style={styles.spaceBlank} />
        </View>
      </View>
    </View>
  );
};

export default CameraScreenVC;

// Estilos originales
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  cameraContainer: {position: 'relative', flex: 5},
  preview: {flex: 1},
  footer: {flex: 1, alignItems: 'center', paddingTop: 15, paddingBottom: 30},
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {width: 60, height: 60, borderRadius: 30, borderWidth: 3},
  photoText: {color: 'gold', paddingBottom: 16},
  grid: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  row: {flex: 1, alignSelf: 'stretch', flexDirection: 'row'},
  gridSqr: {
    flex: 1,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  },
  separated: {justifyContent: 'space-around'},
  flash: {
    flex: 0,
    borderWidth: 0.5,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBlank: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
