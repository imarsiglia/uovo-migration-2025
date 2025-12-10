import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';
import {useEffect, useRef} from 'react';
import {Animated, View} from 'react-native';

export const GeneralLoading = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: (t) => t,
      }),
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={{
        position: 'absolute',
        zIndex: 99999999,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        // opacity: 0.5,
        borderRadius: 20,
      }}>
      <Animated.View style={[{transform: [{rotate: spin}]}]}>
        <Icons.Spinner width={50} height={50} color={COLORS.primary} />
      </Animated.View>
      {/* <ActivityIndicator size="large" color={COLORS.primary} /> */}
    </View>
  );
};
