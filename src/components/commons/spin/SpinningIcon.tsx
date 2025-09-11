import { Icons } from '@assets/icons/icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // o el paquete que uses

type Props = {
  color?: string;
  size?: number;
  spin?: boolean; // activar o no la animación
};

export const SpinningIcon = ({
  color = 'white',
  size = 20,
  spin = false,
}: Props) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (spin) {
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
    }

    return () => {
      animation?.stop?.();
      rotateAnim.setValue(0);
    };
  }, [spin]);

  const spinStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View style={spinStyle}>
      <Icons.Syncro fontSize={size} color={color} />
    </Animated.View>
  );
};
