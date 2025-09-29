import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Alert, Linking, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import {AgendaSchedule} from 'react-native-calendars';
import {
  COLUMNS_WIDTH,
  FINALIZED_COLOR_CREW,
  FINALIZED_STATUS,
  INITIAL_COLOR_CREW,
  PAUSED_COLOR_CREW,
  PAUSED_STATUS,
  PAUSED_STATUS_CREW,
  REPREPPED_STATUS,
  STARTED_COLOR_CREW,
  STARTED_STATUS,
  STARTED_STATUS_CREW,
  STATUS_NATIONAL_SHUTTLE,
  StatusNationalShuttleTye,
  WO_CONFIRMED_STATUS,
} from '@api/contants/constants';
import Orientation from 'react-native-orientation-locker';

export function getFormattedDate(date?: string | Date | null, format?: string) {
  if (!date) {
    return 'N/A';
  }
  return moment(date).format(format ?? 'DD/MM/YYYY');
}

export function getDeviceInfo(): {
  deviceId: string;
  model: string;
  brand: string;
  buildNumber: string;
  osVersion: string;
  timeZone: string;
} {
  const deviceId = DeviceInfo.getDeviceId();
  const buildNumber = DeviceInfo.getVersion();
  const systemVersion = DeviceInfo.getSystemVersion();
  const model = DeviceInfo.getModel();
  const brand = DeviceInfo.getBrand();

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

export function adaptAgendaItemsToArray(itemsObj: AgendaSchedule) {
  return Object.keys(itemsObj)
    .sort() // ordena por fecha
    .flatMap((date) =>
      (itemsObj[date] || []).map((it, idx) => ({
        ...it,
        __date: date,
        __first: idx === 0, // equivalente a firstItemInDay
      })),
    );
}

let DEVICE_TZ = 'UTC';
try {
  const guessed = momentTZ.tz.guess(); // usa Intl si está disponible
  if (guessed && guessed !== 'Etc/Unknown') DEVICE_TZ = guessed;
} catch {
  /* fallback a UTC */
}

export const getDeviceTimeZone = () => DEVICE_TZ;

export function getFormattedDateWithTimezone(
  date: Date | string | number,
  format = 'DD-MM-YYYY',
  errorMessage?: string,
) {
  if (!date && errorMessage) {
    return errorMessage;
  }
  // parseZone respeta el offset si viene en el string (ej: "2025-08-27T18:30:00-05:00")
  // Si no trae offset, lo trata como local y luego lo convierte a la zona del dispositivo.
  return moment.parseZone(date).tz(DEVICE_TZ).format(format);
}

export function debounce<F extends (...args: any[]) => void>(
  callback: F,
  delay: number,
): (...args: Parameters<F>) => void {
  // @ts-ignore
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId); // Limpiar el timeout anterior
    timeoutId = setTimeout(() => {
      callback(...args); // Ejecutar el callback después del retraso
    }, delay);
  };
}

export function getItemColorStatus(loadStatus: StatusNationalShuttleTye) {
  return (
    STATUS_NATIONAL_SHUTTLE[loadStatus]?.color ??
    loadStatus?.toLowerCase() ??
    STATUS_NATIONAL_SHUTTLE.DEFAULT.color
  );
}

export function deriveVisualGroupState({
  offline,
  woStatus,
}: {
  offline: boolean;
  woStatus?: string | null;
}) {
  if (offline) return {visual: 'offline' as const, label: 'Offline'};
  const status = woStatus ?? null;
  if (!status) return {visual: 'inProgress' as const, label: 'WO Confirmed'};
  return getDerivedState(status);
}

export function deriveVisualUserState({
  currentClockInStatus,
}: {
  currentClockInStatus?: string | null;
}) {
  if (!currentClockInStatus) {
    return {visual: null, label: null};
  }
  return getDerivedState(currentClockInStatus);
}

function getDerivedState(status: string) {
  switch (status) {
    case STARTED_STATUS:
      return {visual: 'inProgress' as const, label: status};
    case PAUSED_STATUS:
      return {visual: 'paused' as const, label: status};
    case FINALIZED_STATUS:
      return {visual: 'finished' as const, label: status};
    default:
      return {visual: 'inProgress' as const, label: status};
  }
}

export const getGroupStatusType = (
  isOnline?: boolean,
  status?: string | null,
) => {
  if (!isOnline) return 'offline';
  if (
    status === WO_CONFIRMED_STATUS ||
    status === 'Scheduled' ||
    status?.includes(STARTED_STATUS)
  ) {
    return 'scheduled';
  }
  if (status?.includes(PAUSED_STATUS)) {
    return 'paused';
  }
  if (status?.includes(REPREPPED_STATUS)) {
    return 'reprepped';
  }
  return 'canceled';
};

export const getUserStatusType = (status?: string | null) => {
  if (
    status === WO_CONFIRMED_STATUS ||
    status === 'Scheduled' ||
    status?.includes(STARTED_STATUS)
  ) {
    return 'scheduled';
  }
  if (status?.includes(PAUSED_STATUS)) {
    return 'paused';
  }
  if (status?.includes(REPREPPED_STATUS)) {
    return 'reprepped';
  }
  return 'canceled';
};

export function cleanAddress(address: string) {
  if (!address) {
    return null;
  }
  address = address.replace(
    /(\b(?:suite|ste|floor|fl|piso|unit|apt|apartment|depto|#)\s*#?\s*\d+\b,?\s*)/gi,
    '',
  );
  address = address.replace(/(\d{5})-\d{4}/, '$1');
  address = address.replace(/,\s*,/, ',');
  address = address.trim();
  return address;
}

export function formatAddress(address: string | null | undefined) {
  return address?.replace(/(\r\n|\n|\r)/gm, ' ');
}

export const openInMaps = (lat: number, lng: number, label?: string) => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  });

  const location = `${lat},${lng}`;
  const query = label
    ? `${lat},${lng}(${encodeURIComponent(label)})`
    : location;

  const url = Platform.select({
    ios: `${scheme}//?q=${query}`,
    android: `${scheme}${query}`,
  });

  Linking.openURL(url!).catch((err) => console.error('Error opening map', err));
};

export function isEmail(email: string) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function getColorStatusCrewMember(status?: string | null) {
  const colorStatus =
    status != null && status != ''
      ? status.toUpperCase() == STARTED_STATUS_CREW
        ? STARTED_COLOR_CREW
        : status.toUpperCase() == PAUSED_STATUS_CREW
        ? PAUSED_COLOR_CREW
        : FINALIZED_COLOR_CREW
      : INITIAL_COLOR_CREW;
  return colorStatus;
}

export function capitalize(word: string) {
  if (!word) return '';
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export function lockToLandscape() {
  Orientation.lockToLandscape();
}

export function lockToPortrait() {
  Orientation.lockToPortrait();
}

export function formatWorkedHours(hours?: number, minutes?: number) {
  return `${String(hours ?? 0).padStart(2, '0')}:${String(
    minutes ?? 0,
  ).padStart(2, '0')}:00`;
}

export function moveOtherToEnd(arr: {id: string; name: string}[]) {
  const others = arr.filter((x) => x.name && x.name.toUpperCase() === 'OTHER');
  const rest = arr.filter((x) => !(x.name && x.name.toUpperCase() === 'OTHER'));
  return [...rest, ...others];
}

export const getFormattedNumber = (num: string) => {
  let tempNumber = num;
  tempNumber = tempNumber
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replaceAll('(', '')
    .replaceAll(')', '');
  if (!tempNumber.includes('+')) {
    tempNumber = '+1' + tempNumber;
  }
  return tempNumber;
};

export function sortList<T>(
  list: T[] | undefined,
  field: keyof T,
  ascending: boolean = true,
): T[] {
  return (
    list?.sort((a, b) => {
      const fieldA = a[field];
      const fieldB = b[field];

      if (fieldA === null && fieldB === null) {
        return 0;
      }
      if (fieldA === null) {
        return 1;
      }
      if (fieldB === null) {
        return -1;
      }

      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return ascending
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return ascending ? fieldA - fieldB : fieldB - fieldA;
      } else {
        return 0;
      }
    }) ?? []
  );
}

export const sleep = (ms: number) =>
  new Promise<void>((res) => setTimeout(res, ms));
