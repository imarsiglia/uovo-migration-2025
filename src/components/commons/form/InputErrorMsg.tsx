import {useEffect, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';
import {Label} from '@components/commons/text/Label';
import {COLORS} from '@styles/colors';

type Props = {
  message: string | undefined;
  isHidden?: boolean;
};
export const InputErrorMsg = ({message, isHidden}: Props) => {
  const translateYAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: 2,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -10,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [message]);

  return (
    <Animated.View
      style={{
        minHeight: isHidden && !message ? 0 : 16,
        height: isHidden && !message ? 0 : 'auto',
        transform: [{translateY: translateYAnim}],
        opacity: fadeAnim,
      }}>
      <Label style={styles.errorMessage}>{message}</Label>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  errorMessage: {
    color: COLORS.error,
    fontSize: 11,
  },
});
