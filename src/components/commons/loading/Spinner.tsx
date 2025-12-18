import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';
import {useEffect} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const LoadingSpinner = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, {duration: 1000}), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <Icons.Spinner width={50} height={50} color={COLORS.primary} />
    </Animated.View>
  );
};
