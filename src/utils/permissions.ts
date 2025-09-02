import {Alert, Platform} from 'react-native';
import {
  openSettings,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const permissions =
      Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.SPEECH_RECOGNITION]
        : [PERMISSIONS.ANDROID.RECORD_AUDIO];

    const statuses = await requestMultiple(permissions);

    const allGranted = permissions.every(
      (perm) => statuses[perm] === RESULTS.GRANTED,
    );

    if (allGranted) {
      return true;
    } else {
      Alert.alert(
        'Enable permissions',
        'You must enable microphone and Speech recognition permissions to take dictation.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'Go to settings', onPress: () => openSettings('application')},
        ],
        {cancelable: false},
      );
      return false;
    }
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
    return false;
  }
};

export const requestAccessFineLocationAndroid = async () => {
  try {
    const permissions = [
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ];
    const statuses = await requestMultiple(permissions);
    const allGranted = permissions.every(
      (perm) => statuses[perm] === RESULTS.GRANTED,
    );
    return allGranted;
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
    return false;
  }
};
