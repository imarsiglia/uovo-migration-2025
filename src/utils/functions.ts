import {Platform} from 'react-native';
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
