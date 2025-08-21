import {Image, StyleSheet, View} from 'react-native';

export const Splash = () => {
  return (
    <Image
      style={styles.splash}
      resizeMode="cover"
      source={require('@assets/splash/bgSplashScreen.png')}
    />
  );
};

const styles = StyleSheet.create({
  splash: {
    width: '100%',
    height: '100%',
  },
});
