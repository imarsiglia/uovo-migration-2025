import { COLORS } from '@styles/colors';
import { Platform, StatusBar } from 'react-native';
import { StatusBar as StatusBarComponent } from 'react-native-scrollable-navigation-bar';

export const CustomStatusBar = () => {
  return (
    <>
      {Platform.OS == 'ios' && <StatusBarComponent backgroundColor={'red'}/>}

      {Platform.OS == 'android' && (
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      )}
    </>
  );
};
