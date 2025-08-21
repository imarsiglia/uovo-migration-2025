import React, { forwardRef } from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

type CustomPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  /** Estilo adicional propio del wrapper */
  customStyle?: StyleProp<ViewStyle>;
  /** Mantiene el tipo original de Pressable */
  style?: PressableProps['style'];
};

export const CustomPressable = forwardRef<View, CustomPressableProps>(
  ({ children, style, customStyle, ...rest }, ref) => {
    const mergedStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => ([
      { opacity: state.pressed ? 0.5 : 1 },
      customStyle,
      typeof style === 'function' ? style(state) : style,
    ]);

    return (
      <Pressable ref={ref} style={mergedStyle} {...rest}>
        {children}
      </Pressable>
    );
  }
);

CustomPressable.displayName = 'CustomPressable';