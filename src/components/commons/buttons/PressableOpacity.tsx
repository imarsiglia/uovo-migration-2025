import { Pressable, PressableProps, ViewStyle } from 'react-native';

export const PressableOpacity = (props: PressableProps) => {
  return (
    <Pressable
      {...props}
      style={({pressed}) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
        props.style as ViewStyle,
      ]}
    />
  );
};
