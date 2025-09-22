import { TouchableOpacityProps } from 'react-native';
// @ts-ignore
import _ from 'lodash';
import { useMemo } from 'react';
import { PressableOpacity } from './PressableOpacity';

type DebouncedTouchableOpacityProps = TouchableOpacityProps & {
  debounceTime?: number;
};

export const DebouncedTouchableOpacity: React.FC<DebouncedTouchableOpacityProps> =
  ({onPress, debounceTime = 600, ...props}) => {
    // Usamos debounce para crear una función que no puede ser llamada más de una vez cada debounceTime ms
    const debouncedOnPress = useMemo(
      () => _.debounce(onPress, debounceTime, {leading: true, trailing: false}),
      [onPress, debounceTime],
    );

    return <PressableOpacity {...props} onPress={debouncedOnPress} />;
  };
