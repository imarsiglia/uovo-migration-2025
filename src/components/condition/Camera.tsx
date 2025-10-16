// CameraScreenVC.tsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Icon from 'react-native-fontawesome-pro';

type Props = {onCapture: (payload: {photo: {path: string}}) => void};

const CameraScreenVC: React.FC<Props> = ({onCapture}) => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [torch, setTorch] = useState<'off' | 'on'>('off');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const toggleTorch = useCallback(() => {
    setTorch((t) => (t === 'on' ? 'off' : 'on'));
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    // El flash del disparo se controla con la opción `flash`
    const photo = await cameraRef.current.takePhoto({
      flash: torch === 'on' ? 'on' : 'off',
    });
    onCapture?.({photo});
  }, [onCapture, torch]);

  if (device == null)
    return <View style={{flex: 1, backgroundColor: 'black'}} />;

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.preview}
          device={device}
          isActive
          photo
          torch={torch}
          enableZoomGesture
        />
        {/* Overlay de cuadrícula */}
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

// Reusa los mismos estilos del ejemplo anterior
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
