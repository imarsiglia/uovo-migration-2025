import React, {forwardRef, useCallback} from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-fontawesome-pro';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {COLORS} from '@styles/colors';
import {showToastMessage} from '@utils/toast';
import {RBSheetRef} from './ImageOptionSheet';

// Íconos reales (mismos de APP_LIST)
const googlemapsIcon = require('../../../assets/navigation_icons/google_maps_icon.png');
const wazeIcon = require('../../../assets/navigation_icons/waze_icon.png');
const citymapperIcon = require('../../../assets/navigation_icons/citymapper_icon.png');
const mapsIcon = require('../../../assets/navigation_icons/maps_icon.png');
const yandexIcon = require('../../../assets/navigation_icons/yandex_icon.png');
const sygicIcon = require('../../../assets/navigation_icons/sygic_icon.png');
const mapsmeIcon = require('../../../assets/navigation_icons/mapsme_icon.png');
const tomtomIcon = require('../../../assets/navigation_icons/tomtom_icon.png');

type MapParams = {
  lat: number;
  lng: number;
  address?: string;
  label?: string;
};

type MapApp = {
  id: string;
  name: string;
  urlScheme: string; // para canOpenURL
  icon: string;
  iconType?: 'solid' | 'light' | 'regular' | 'brands';
  color: string;
  iconImage?: ImageSourcePropType; // logo real
  getUrl: (params: MapParams) => string;
};

// Apps de mapas para iOS
const MAP_APPS_IOS: MapApp[] = [
  {
    id: 'apple-maps',
    name: 'Maps',
    urlScheme: 'maps://', // name_2: maps
    icon: 'map',
    iconType: 'solid',
    color: '#007AFF',
    iconImage: mapsIcon,
    getUrl: ({lat, lng, label}) =>
      `maps://maps.apple.com/?q=${encodeURIComponent(
        label || 'Location',
      )}&ll=${lat},${lng}`,
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    urlScheme: 'comgooglemaps://', // name_2: comgooglemaps
    icon: 'map-marked-alt',
    iconType: 'solid',
    color: '#4285F4',
    iconImage: googlemapsIcon,
    getUrl: ({lat, lng, label}) =>
      `comgooglemaps://?q=${encodeURIComponent(
        label || `${lat},${lng}`,
      )}&center=${lat},${lng}&zoom=14`,
  },
  {
    id: 'waze',
    name: 'Waze',
    urlScheme: 'waze://', // name_2: waze
    icon: 'road',
    iconType: 'solid',
    color: '#33CCFF',
    iconImage: wazeIcon,
    getUrl: ({lat, lng}) => `waze://?ll=${lat},${lng}&navigate=yes`,
  },
  {
    id: 'citymapper',
    name: 'Citymapper',
    urlScheme: 'citymapper://', // name_2: citymapper
    icon: 'subway',
    iconType: 'solid',
    color: '#76C063',
    iconImage: citymapperIcon,
    getUrl: ({lat, lng}) => `citymapper://directions?endcoord=${lat},${lng}`,
  },
  {
    id: 'yandex',
    name: 'Yandex Navigator',
    urlScheme: 'yandexnavi://', // name_2: yandexnavi
    icon: 'location-arrow',
    iconType: 'solid',
    color: '#FFCC00',
    iconImage: yandexIcon,
    getUrl: ({lat, lng}) =>
      `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`,
  },
  {
    id: 'sygic',
    name: 'Sygic',
    urlScheme: 'com.sygic.aura://', // name_2: com.sygic.aura
    icon: 'location-arrow',
    iconType: 'solid',
    color: '#00C3FF',
    iconImage: sygicIcon,
    // OJO: Sygic usa orden lon|lat
    getUrl: ({lat, lng}) => `com.sygic.aura://coordinate|${lng}|${lat}|drive`,
  },
  {
    id: 'maps-me',
    name: 'MAPS.ME',
    urlScheme: 'mapsme://', // name_2: mapsme
    icon: 'map',
    iconType: 'solid',
    color: '#39AC37',
    iconImage: mapsmeIcon,
    getUrl: ({lat, lng, label}) =>
      `mapsme://map?ll=${lat},${lng}&n=${encodeURIComponent(
        label || 'Location',
      )}`,
  },
  {
    id: 'tomtom',
    name: 'TomTom',
    urlScheme: 'tomtomhome://', // name_2: tomtomhome
    icon: 'map-marked',
    iconType: 'solid',
    color: '#FF4B3E',
    iconImage: tomtomIcon,
    getUrl: ({lat, lng}) =>
      `tomtomhome://geo:action=navigateto&lat=${lat}&long=${lng}`,
  },
];

export type MapAppBottomSheetRef = {
  open: (params: MapParams) => void;
  close: () => void;
};

type MapAppBottomSheetProps = {
  title?: string;
  message?: string;
  height?: number;
};

export const MapAppBottomSheet = forwardRef<
  MapAppBottomSheetRef,
  MapAppBottomSheetProps
>(({title = 'Open location with', message, height = 240}, ref) => {
  const bottomSheetRef = React.useRef<RBSheetRef>(null);
  const [mapParams, setMapParams] = React.useState<MapParams | null>(null);
  const [availableApps, setAvailableApps] = React.useState<MapApp[]>([]);
  const [isChecking, setIsChecking] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    open: async (params: MapParams) => {
      setMapParams(params);
      setIsChecking(true);
      bottomSheetRef.current?.open();
      await checkAvailableApps();
      setIsChecking(false);
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
  }));

  const checkAvailableApps = useCallback(async () => {
    const available: MapApp[] = [];

    for (const app of MAP_APPS_IOS) {
      try {
        // IMPORTANTE: usamos el scheme básico, no la URL completa
        const canOpen = await Linking.canOpenURL(app.urlScheme);
        if (canOpen) {
          available.push(app);
        }
      } catch (error) {
        console.log(`Error checking ${app.name}:`, error);
      }
    }

    // Si no hay apps instaladas, no añadimos TomTom ni nada extraño.
    // Podrías agregar aquí un fallback al browser si quieres.
    setAvailableApps(available);
  }, []);

  const openMapApp = useCallback(
    async (app: MapApp) => {
      if (!mapParams) return;

      try {
        const url = app.getUrl(mapParams);
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
          bottomSheetRef.current?.close();
        } else {
          showToastMessage(`Cannot open ${app.name}`);
        }
      } catch (error) {
        showToastMessage(`Error opening ${app.name}`);
        console.error(`Error opening ${app.name}:`, error);
      }
    },
    [mapParams],
  );

  return (
    <RBSheet
      ref={bottomSheetRef}
      height={height}
      draggable
      closeOnPressMask={true}
      customStyles={{
        container: {
          paddingHorizontal: 20,
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
          backgroundColor: COLORS.bgWhite,
        },
        wrapper: {
          backgroundColor: '#eeeeee5e', // 👈 sin height aquí
        },
        draggableIcon: {
          backgroundColor: 'gray',
          width: 100,
        },
      }}>
      <View style={{flex: 1, paddingHorizontal: 0}}>
        <View style={{marginBottom: 5, marginTop: 10}}>
          <Text style={{fontWeight: 'bold', fontSize: 14}}>{title}</Text>
          {/* {message ? (
            <Text style={{marginTop: 4, color: '#666'}}>{message}</Text>
          ) : null} */}
        </View>

        <ScrollView
          style={styles.gridContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {isChecking ? (
              <View style={styles.loadingState}>
                <Label style={styles.loadingText}>
                  Checking available apps...
                </Label>
              </View>
            ) : (
              availableApps.map((app, i) => (
               <PressableOpacity
                  key={app.id}
                  style={styles.appItem}
                  onPress={() => openMapApp(app)}
                  accessibilityLabel={`Open in ${app.name}`}>
                  <View
                    style={[
                      styles.iconContainer,
                      //   {backgroundColor: app.color + '20'},
                    ]}>
                    {app.iconImage ? (
                      <Image
                        source={app.iconImage}
                        style={styles.appIconImage}
                      />
                    ) : (
                      <Icon
                        name={app.icon}
                        size={26}
                        color={app.color}
                        type={app.iconType || 'solid'}
                      />
                    )}
                  </View>
                  <Text style={styles.appName} numberOfLines={1}>
                    {app.name}
                  </Text>
                </PressableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => bottomSheetRef.current?.close()}>
        <Text>Close</Text>
      </TouchableOpacity>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  gridContainer: {
    marginTop: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: "flex-start"
  },
  appItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  appIconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 12
  },
  appName: {
    fontSize: 11,
    color: '#3C424A',
    textAlign: 'center',
  },
  loadingState: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 10,
    paddingBottom: 40,
    paddingRight: 20,
  },
});
