import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Alert, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';

export function getDeviceInfo(): {
  deviceId: string;
  model: string;
  brand: string;
  buildNumber: string;
  osVersion: string;
  timeZone: string;
} {
  var deviceId = DeviceInfo.getDeviceId();
  let buildNumber = DeviceInfo.getVersion();
  var systemVersion = DeviceInfo.getSystemVersion();
  var model = DeviceInfo.getModel();
  var brand = DeviceInfo.getBrand();

  return {
    deviceId,
    model,
    brand,
    buildNumber,
    osVersion: systemVersion,
    timeZone: getTimeZone(),
  };
}

export function getDeviceInfoAsString() {
  const {
    getDeviceId,
    getModel,
    getBrand,
    getSystemVersion,
    getVersion,
    getBundleId,
  } = DeviceInfo;
  return `Device Id: ${getDeviceId()} 
      - Model: ${getModel()} 
      - Brand: ${getBrand()}
      - OS Version: ${getSystemVersion()}
      - Build Number: ${getVersion()}
      - Platform: ${Platform.OS}
      - Bundle ID: ${getBundleId()}`;
}

export function getTimeZone(): string {
  return RNLocalize.getTimeZone();
}

export function getInputIdFormContext(
  mObject: any,
  way: string,
): any | undefined {
  const parts = way.split('.');
  let currentValue = mObject;

  for (const part of parts) {
    if (
      currentValue &&
      typeof currentValue === 'object' &&
      part in currentValue
    ) {
      currentValue = currentValue[part];
    } else {
      return undefined;
    }
  }

  return currentValue;
}

export function isAndroid() {
  return Platform.OS == 'ios';
}

export async function closeSessionOnGoogle() {
  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.revokeAccess(); // desvincula
    }
    await GoogleSignin.signOut(); // iOS: limpia sesión
  } catch (e) {}
}

export function showAlertDialogWithOptions(onConfirm: () => void) {
  Alert.alert(
    'Logout',
    'Sure want to logout?',
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: onConfirm},
    ],
    {cancelable: false},
  );
}
