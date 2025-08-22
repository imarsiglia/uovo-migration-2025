import {useAuth} from '@store/auth';
import {COLORS} from '@styles/colors';
import {useMemo} from 'react';
import {Platform, StatusBar} from 'react-native';
import {StatusBar as StatusBarComponent} from 'react-native-scrollable-navigation-bar';

export const CustomStatusBar = () => {
  const token = useAuth((d) => d.token);

  const isAuthenticated = useMemo(() => {
    return token != null;
  }, [token]);

  return (
    <>
      {Platform.OS == 'ios' ? (
        <StatusBarComponent
          backgroundColor={isAuthenticated ? COLORS.statusbar : COLORS.primary}
        />
      ) : (
        <StatusBar
          barStyle="light-content"
          backgroundColor={isAuthenticated ? COLORS.statusbar : COLORS.primary}
        />
      )}
    </>
  );
};
