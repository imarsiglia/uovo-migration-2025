import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {useModalLoadingStore} from '@store/modals';
import {Wrapper} from '../wrappers/Wrapper';
import {GeneralLoading} from '../loading/GeneralLoading';

export const ModalLoading = () => {
  const visible = useModalLoadingStore((d) => d.loadingVisible);
  const scale = useRef(new Animated.Value(0.5)).current; // Empieza pequeño
  const opacity = useRef(new Animated.Value(0)).current; // Comienza invisible

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200, // Duración corta
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Wrapper style={styles.overlay}>
      <Animated.View style={[styles.modal, {transform: [{scale}], opacity}]}>
        <GeneralLoading style={{position: 'relative', zIndex: 0}} />
      </Animated.View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Overlay con opacidad
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  modal: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
