// openDirectionsChooser.ts
import { ActionSheetIOS, Linking, Platform } from 'react-native';

export type LatLng = { lat: number; lng: number };

export type IOSNavCandidate = {
  id: string;                         // identificador interno
  name: string;                       // texto que verá el usuario
  scheme: string;                     // p.ej. 'comgooglemaps://'
  buildURL: (p: LatLng & { label?: string }) => string; // deep link final
};

const Native = (() => {
  try {
    const { NavigationApps } = require('react-native').NativeModules as {
      NavigationApps?: {
        openGeoChooser(lat: number, lng: number, label?: string): Promise<boolean>;
      };
    };
    return NavigationApps;
  } catch { return undefined; }
})();

/** Muestra chooser de navegación cross-platform */
export async function openDirectionsChooser(
  coords: LatLng,
  label?: string,
  iosCandidates: IOSNavCandidate[] = [],
) {
  if (Platform.OS === 'android') {
    // Preferido: chooser nativo vía tu bridge
    if (Native?.openGeoChooser) {
      await Native.openGeoChooser(coords.lat, coords.lng, label);
      return;
    }
    // Fallback: intent geo (puede mostrar chooser si no hay app por defecto)
    const geo = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${coords.lng}${
      label ? `(${encodeURIComponent(label)})` : ''
    }`;
    await Linking.openURL(geo);
    return;
  }

  // iOS: filtra candidatos instalados por scheme
  const available: IOSNavCandidate[] = [];
  for (const c of iosCandidates) {
    try {
      const supported = await Linking.canOpenURL(c.scheme);
      if (supported) available.push(c);
    } catch {}
  }

  // Siempre deja Apple Maps como último fallback
  const APPLE_MAPS: IOSNavCandidate = {
    id: 'apple-maps',
    name: 'Apple Maps',
    scheme: 'maps://',
    buildURL: ({ lat, lng, label }) =>
      `maps://?daddr=${lat},${lng}${label ? `&q=${encodeURIComponent(label)}` : ''}`,
  };

  const openCandidate = async (c: IOSNavCandidate) => {
    const url = c.buildURL({ ...coords, label });
    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);
    return Linking.openURL(APPLE_MAPS.buildURL({ ...coords, label }));
  };

  if (available.length === 0) {
    await openCandidate(APPLE_MAPS);
    return;
  }

  // ActionSheet nativo con todas las apps disponibles
  await new Promise<void>(resolve => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Open with',
        options: [...available.map(a => a.name), 'Cancel'],
        cancelButtonIndex: available.length,
      },
      async (idx) => {
        if (idx >= 0 && idx < available.length) {
          await openCandidate(available[idx]);
        }
        resolve();
      },
    );
  });
}
