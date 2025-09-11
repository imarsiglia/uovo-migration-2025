import {forwardRef} from 'react';
import {
  Pressable,
  PressableProps,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = PressableProps & {
  activeOpacity?: number;
  disabledOpacity?: number;
};

export const PressableOpacity = forwardRef<View, Props>(
  (
    {activeOpacity = 0.7, disabledOpacity = 0.3, style, disabled, ...rest},
    ref,
  ) => {
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        {...rest}
        style={({pressed}) => {
          const userStyle =
            typeof style === 'function' ? (style as any)({pressed}) : style;

          return [
            userStyle as StyleProp<ViewStyle>,
            {
              opacity: disabled ? disabledOpacity : pressed ? activeOpacity : 1,
            },
          ];
        }}
      />
    );
  },
);