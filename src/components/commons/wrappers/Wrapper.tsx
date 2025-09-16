import {COLORS} from '@styles/colors';
import {useColorScheme, View, ViewProps} from 'react-native';

export const Wrapper = (props: ViewProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? COLORS.dark : 'transparent',
  // };

  const backgroundStyle = {
    backgroundColor: 'transparent',
  };

  return <View {...props} style={[backgroundStyle, props.style]} />;
};
