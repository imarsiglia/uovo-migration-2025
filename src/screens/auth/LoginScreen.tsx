import { useLogin } from '@api/hooks/HooksAuthentication';
import { IndicatorLoading } from '@components/commons/loading/IndicatorLoading';
import { CustomPressable } from '@components/commons/pressable/CustomPressable';
import { initCnfigureGoogleSignIn } from '@config/google/GoogleSignIn';
import { RoutesNavigation } from '@navigation/types';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '@store/auth';
import { COLORS } from '@styles/colors';
import { getDeviceInfo } from '@utils/functions';
import { useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomNavigation } from 'src/hooks/useCustomNavigation';

const logotipo = require('../../assets/logotipo/logotipo.png');

initCnfigureGoogleSignIn();

export const LoginScreen = () => {
  const setSession = useAuth((d) => d.setSession);
  const {mutateAsync: loginAsync, isPending} = useLogin();
  const {resetTo, navigate} = useCustomNavigation();
  const {top} = useSafeAreaInsets();

  useEffect(() => {
    // Orientation.lockToPortrait();
  }, []);

  const doBackendLogin = useCallback(
    async (idToken: string) => {
      // Llama tu API y decide a qué ruta ir
      const data = await loginAsync({
        token: idToken,
        ...getDeviceInfo(),
      });

      // Store en memoria
      setSession(data.token, data);

      // Navegación
      if (data.user_updated === 0) {
        resetTo(RoutesNavigation.EditProfile);
      } else {
        resetTo(RoutesNavigation.Home);
      }
    },
    [loginAsync, resetTo, setSession],
  );

  const onGoogleButtonPress = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const res = await GoogleSignin.signIn();
      const idToken = (res as any)?.data?.idToken ?? (res as any)?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Google sign-in failed. Please try again.');
        return;
      }

      // Firebase sign-in (modular)
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getAuth(), credential);

      // Login de backend
      await doBackendLogin(idToken);
    } catch (err: any) {
      // Limpieza de sesión de Google si algo falla
      try {
        if (Platform.OS === 'android') {
          await GoogleSignin.revokeAccess(); // desvincula
        } else {
          await GoogleSignin.signOut(); // iOS: limpia sesión
        }
      } catch {}

      console.error('[LoginError]', err?.message ?? err);
      Alert.alert(
        'Attention',
        'The Google account does not belong to the organization',
      );
    }
  }, [doBackendLogin]);

  const goToContactUs = () => {
    navigate(RoutesNavigation.ContactUs, {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{height: top, backgroundColor: COLORS.primary}} />

      <View style={styles.content}>
        {isPending && <IndicatorLoading />}

        {!isPending && (
          <View style={[styles.bottom]}>
            <View style={styles.logotipoContainer}>
              <Image
                style={styles.logotipo}
                resizeMode="contain"
                source={logotipo}
              />
            </View>
            <View style={styles.formContainer}>
              <CustomPressable
                style={styles.button}
                onPress={() => onGoogleButtonPress()}>
                <Text style={styles.buttonTitle}>Sign in with Google</Text>
              </CustomPressable>
              <CustomPressable
                // onPress={() => props.navigation.navigate('LoginEmail')}
                style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: 'white', fontSize: 14}}>
                  Developer login
                </Text>
              </CustomPressable>
            </View>

            <View style={styles.footerContainer}>
              <View style={{padding: 5, paddingRight: 0}}>
                <Text style={[styles.footerText, {color: '#a9a9aa'}]}>
                  Need help?
                </Text>
              </View>
              <CustomPressable style={{padding: 5}} onPress={goToContactUs}>
                <Text style={[styles.footerText, {color: 'white'}]}>
                  Contact us
                </Text>
              </CustomPressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    height: '100%',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  logotipoContainer: {
    paddingRight: 30,
    paddingLeft: 30,
    marginBottom: 300,
  },
  logotipo: {
    width: '75%',
    height: 60,
  },
  formContainer: {
    paddingRight: 30,
    paddingLeft: 30,
  },
  button: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: 'white',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '300',
  },
  footerContainer: {
    backgroundColor: COLORS.secondary,
    height: 60,
    paddingTop: 10,
    marginTop: 70,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 12,
  },
});
