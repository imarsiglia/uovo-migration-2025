import {forwardRef} from 'react';
import {Pressable, PressableProps, View, ViewStyle} from 'react-native';

export const PressableOpacity = forwardRef(
  (props: PressableProps, ref: React.Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={({pressed}) => [
          {
            opacity: pressed ? 0.7 : 1,
          },
          props.style as ViewStyle,
        ]}
      />
    );
  },
);
