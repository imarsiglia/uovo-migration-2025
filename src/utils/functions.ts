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
  STARTED_COLOR_CREW,
  STARTED_STATUS,
  STARTED_STATUS_CREW,
  STATUS_NATIONAL_SHUTTLE,
  StatusNationalShuttleTye,
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

export function deriveVisualState({
  offline,
  currentClockInStatus,
  woStatus,
}: {
  offline: boolean;
  currentClockInStatus?: string | null;
  woStatus?: string | null;
}) {
  if (offline) return {visual: 'offline' as const, label: 'Offline'};

  // Prioriza current_clock_in.status si existe
  const status = currentClockInStatus ?? woStatus ?? null;

  if (!status) return {visual: 'inProgress' as const, label: 'WO Confirmed'};

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
