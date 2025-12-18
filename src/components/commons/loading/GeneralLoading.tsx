import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';
import {useEffect, useRef} from 'react';
import {Animated, Easing, StyleProp, View, ViewStyle} from 'react-native';
import {LoadingSpinner} from './Spinner';

type Props = {
  style?: StyleProp<ViewStyle>;
};
export const GeneralLoading = (props: Props) => {
  // const spinValue = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   spinValue.setValue(0);

  //   const anim = Animated.loop(
  //     Animated.timing(spinValue, {
  //       toValue: 1,
  //       duration: 900,
  //       easing: Easing.linear,
  //       useNativeDriver: true,
  //       isInteraction: false,
  //     }),
  //   );

  //   anim.start();
  //   return () => anim.stop();
  // }, [spinValue]);

  // const spin = spinValue.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ['0deg', '360deg'],
  // });

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          elevation: 10,
        },
        props.style,
      ]}>
      <View
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'white',
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <LoadingSpinner />
        {/* <Animated.View style={{transform: [{rotate: spin}]}}>
          <Icons.Spinner width={50} height={50} color={COLORS.primary} />
        </Animated.View> */}
      </View>
    </View>
  );
};
