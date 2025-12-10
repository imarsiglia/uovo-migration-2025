import Geolocation from '@react-native-community/geolocation';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import Icon from 'react-native-fontawesome-pro';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';

import {CANDIDATES_IOS} from '@api/contants/constants';
import {
  useGetEstimatedTimeByLocation,
  useGetLatLong,
} from '@api/hooks/HooksGeneralServices';
import {useLetsGo} from '@api/hooks/HooksJobServices';
import {AddressType, AddressTypes} from '@api/types/Jobs';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {IndicatorLoading} from '@components/commons/loading/IndicatorLoading';
import CustomMenu from '@components/commons/menu/CustomMenu';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {openDirectionsChooser} from '@components/helpers/openDirectionsChooser';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {formatAddress, openInMaps} from '@utils/functions';
import {requestAccessFineLocationAndroid} from '@utils/permissions';
import {showToastMessage} from '@utils/toast';
import {ReportLocationProblem} from '@components/topheet/ReportLocationProblem';
import {
  MapAppBottomSheet,
  MapAppBottomSheetRef,
} from '@components/commons/bottomsheets/MapAppBottomSheet';

const INITIAL_DELTAS = {
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

export const LocationTopsheet = () => {
  const mapAppBottomSheetRef = useRef<MapAppBottomSheetRef>(null);

  const [currentPosition, setCurrentPosition] = useState<
    {latitude: number; longitude: number} | undefined
  >();
  const [showEstimated, setShowEstimated] = useState(false);
  const [typeAddress, setTypeAddress] = useState<AddressType>(
    AddressTypes.Shipper,
  );
  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  const showModalDialogVisible = useModalDialogStore((d) => d.showVisible);
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {navigate} = useCustomNavigation();

  const {mutateAsync: requestLetsGo} = useLetsGo({
    onError: () => {
      showToastMessage('Could not start navigation, try again.');
    },
    onSuccess: (response: any) => {
      if (response?.status === 299) {
        showModalDialogVisible({
          modalVisible: true,
          type: 'error',
          message: response.message,
          confirmBtnLabel: 'OK',
          cancelable: false,
          onConfirm: () =>
            setTimeout(() => {
              showModalDialogVisible({
                modalVisible: true,
                title: 'Success',
                message: 'ETA alert sent successfully',
                type: 'success',
                cancelable: false,
                onConfirm: () => {
                  showNavigationApps();
                },
                confirmBtnLabel: 'OK',
              });
            }, 300),
        });
      } else if (response?.status == 409) {
        showModalDialogVisible({
          modalVisible: true,
          type: 'error',
          message: response.message,
          confirmBtnLabel: 'Yes',
          cancelBtnLabel: 'No',
          onConfirm: () => {
            loadingWrapperPromise(
              requestLetsGo({
                estimate: estimatedTime?.value!,
                force_send: true,
                type: typeAddress.toUpperCase(),
                idJob: jobDetail?.id!,
              }),
            );
          },
          onCancel: showNavigationApps,
        });
      } else {
        showModalDialogVisible({
          modalVisible: true,
          title: 'Success',
          message: 'ETA alert sent successfully',
          type: 'success',
          cancelable: false,
          onConfirm: () => {
            showNavigationApps();
          },
          confirmBtnLabel: 'OK',
        });
      }
    },
  });

  // Dirección formateada actual
  const formattedAddress = useMemo(() => {
    const raw =
      typeAddress === AddressTypes.Shipper
        ? jobDetail?.shipper_address_formated
        : jobDetail?.consignee_address_formated;
    return formatAddress(raw ?? '');
  }, [
    typeAddress,
    jobDetail?.shipper_address_formated,
    jobDetail?.consignee_address_formated,
  ]);

  //@ts-ignore
  const hasValidAddress = formattedAddress?.trim()?.length > 0;

  // Geocodificación -> coordenadas
  const {data: coordinate, isLoading: isLoadingCoordinate} =
    useGetLatLong(formattedAddress);

  // Región inicial SIEMPRE válida para MapView
  const initialRegion: Region = useMemo(
    () => ({
      latitude: coordinate?.latitude ?? 0,
      longitude: coordinate?.longitude ?? 0,
      ...INITIAL_DELTAS,
    }),
    [coordinate],
  );
  // Region controlada (solo si hay coords)
  const controlledRegion: Region | undefined = useMemo(() => {
    if (!coordinate) return undefined;
    return {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      ...INITIAL_DELTAS,
    };
  }, [coordinate?.latitude, coordinate?.longitude]);

  // Estimación de tiempo
  const {data: estimatedTime, isLoading: isLoadingEstimatedTime} =
    useGetEstimatedTimeByLocation({
      fromLat: currentPosition?.latitude!,
      fromLng: currentPosition?.longitude!,
      toLat: coordinate?.latitude,
      toLng: coordinate?.longitude,
      showEstimated,
    });

  const showNavigationApps = useCallback(() => {
    if (!hasValidAddress || !coordinate) {
      showToastMessage('Selected address is not valid');
      return;
    }

    if (Platform.OS === 'ios') {
      // iOS: Bottom sheet custom
      mapAppBottomSheetRef.current?.open({
        lat: coordinate.latitude,
        lng: coordinate.longitude,
        label: formattedAddress,
      });
    } else {
      // Android: Chooser nativo (tu código actual)
      openDirectionsChooser(
        {lat: coordinate.latitude, lng: coordinate.longitude},
        formattedAddress,
        CANDIDATES_IOS,
      );
    }
  }, [hasValidAddress, coordinate, formattedAddress]);

  // const showNavigationApps = useCallback(() => {
  //   if (!hasValidAddress || !coordinate) {
  //     showToastMessage('Selected address is not valid');
  //     return;
  //   }
  //   openDirectionsChooser(
  //     {lat: coordinate.latitude, lng: coordinate.longitude},
  //     formattedAddress,
  //     CANDIDATES_IOS,
  //   );
  // }, [hasValidAddress, coordinate, typeAddress, formattedAddress]);

  const openNavigation = useCallback(() => {
    if (!estimatedTime || !jobDetail) {
      return;
    }
    loadingWrapperPromise(
      requestLetsGo({
        estimate: estimatedTime.value!,
        force_send: false,
        type: typeAddress.toUpperCase(),
        idJob: jobDetail.id,
      }).catch(() => {}),
    );
  }, [estimatedTime, jobDetail, typeAddress]);

  const openMaps = useCallback(() => {
    if (hasValidAddress && coordinate) {
      openInMaps(
        coordinate.latitude,
        coordinate.longitude,
        `${typeAddress}: ${formattedAddress}`,
      );
    } else {
      showToastMessage('Selected address is not valid');
    }
  }, [hasValidAddress, coordinate, typeAddress, formattedAddress]);

  const estimateTime = useCallback(
    (open?: boolean) => {
      if (!coordinate) {
        showToastMessage('Selected address is not valid');
      }
      try {
        Geolocation.getCurrentPosition(
          (position) => {
            setCurrentPosition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setShowEstimated(true);
            if (open) {
              setShouldOpenModal(true);
            }
          },
          (error) =>
            showToastMessage(
              `Could not estimate time, try again.\n${error.message}`,
            ),
          Platform.OS === 'ios'
            ? {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
            : {},
        );
      } catch {
        showToastMessage('Could not estimate time, try again');
      }
    },
    [coordinate, typeAddress, estimatedTime, jobDetail, openNavigation],
  );

  const requestGpsPermission = useCallback(
    async (open?: boolean) => {
      if (Platform.OS === 'android') {
        const granted = await requestAccessFineLocationAndroid();
        if (!granted) {
          showToastMessage(
            'Permission to access location was denied. Cannot estimate time.',
          );
          return;
        }
        const enabled = await isLocationEnabled();
        if (!enabled) {
          try {
            await promptForEnableLocationIfNeeded({
              interval: 10000,
              waitForAccurate: true,
            });
            estimateTime(open);
          } catch {
            showToastMessage('GPS disabled');
          }
        } else {
          estimateTime(open);
        }
      } else {
        estimateTime(open);
      }
    },
    [estimateTime],
  );

  const etaAnim = useRef(new Animated.Value(0)).current;

  const showEta = useCallback(() => {
    Animated.timing(etaAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (shouldOpenModal) {
        showModalDialogVisible({
          modalVisible: true,
          message: 'Your ETA will be sent to the client now',
          type: 'info',
          cancelable: true,
          onConfirm: () => {
            openNavigation();
          },
        });
        setShouldOpenModal(false);
      }
    });
  }, [
    etaAnim,
    shouldOpenModal,
    openNavigation,
    estimatedTime,
    jobDetail,
    typeAddress,
  ]);

  const hideEta = useCallback(() => {
    Animated.timing(etaAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [etaAnim]);

  useEffect(() => {
    if (!showEstimated) {
      hideEta();
      return;
    }
    if (estimatedTime?.value) {
      isLoadingEstimatedTime ? hideEta() : showEta();
    }
  }, [isLoadingEstimatedTime, showEstimated, estimatedTime, hideEta, showEta]);

  const onChangeAddress = useCallback(
    (type: AddressType) => {
      if (type != typeAddress) {
        setShowEstimated(false);
      }
      setTypeAddress(type);
    },
    [typeAddress],
  );

  const getColorByTypeAddress = useCallback(
    (type: AddressType) => (type === typeAddress ? COLORS.primary : '#898989'),
    [typeAddress],
  );

  const showLocationNotes = useCallback(() => {
    if (typeAddress && formattedAddress && jobDetail?.id)
      navigate(RoutesNavigation.LocationNotes, {
        idJob: jobDetail?.id,
        type: typeAddress,
      });
  }, [typeAddress, jobDetail]);

  if (!jobDetail) return null;

  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}>
      {/* Tabs Shipper / Consignee */}
      <Wrapper style={[GLOBAL_STYLES.row, styles.tabs]}>
        <TabButton
          icon="person-dolly"
          label="Shipper"
          color={getColorByTypeAddress(AddressTypes.Shipper)}
          active={typeAddress === AddressTypes.Shipper}
          onPress={() => onChangeAddress(AddressTypes.Shipper)}
        />
        <TabButton
          icon="person-carry"
          label="Consignee"
          color={getColorByTypeAddress(AddressTypes.Consignee)}
          active={typeAddress === AddressTypes.Consignee}
          onPress={() => onChangeAddress(AddressTypes.Consignee)}
        />
      </Wrapper>

      {/* Mapa */}
      <Wrapper style={styles.mapWrap}>
        {isLoadingCoordinate && (
          <IndicatorLoading
            activityIndicatorProps={{color: COLORS.primary}}
            containerStyle={styles.mapSpinner}
          />
        )}

        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          region={controlledRegion}>
          {coordinate && (
            <Marker
              key="active"
              pinColor="#ff9500"
              coordinate={coordinate}
              title={typeAddress}
              description={formattedAddress}
            />
          )}
        </MapView>

        {!hasValidAddress && (
          <Wrapper style={styles.mapOverlay}>
            <Label style={styles.mapOverlayText}>Address not available</Label>
          </Wrapper>
        )}
      </Wrapper>

      {/* Where */}
      <Wrapper style={[GLOBAL_STYLES.row, styles.whereRow]}>
        <Label style={styles.where}>Where?</Label>
        <PressableOpacity
          style={styles.whereBtn}
          onPress={openMaps}
          disabled={!hasValidAddress || !coordinate}
          accessibilityLabel={`Open ${typeAddress} address in maps`}>
          <Wrapper style={GLOBAL_STYLES.row}>
            <Icon
              name="map-marker-alt"
              size={16}
              color={COLORS.primary}
              type="solid"
            />
            <Label style={styles.textLocation}>
              {hasValidAddress ? formattedAddress : 'Unassigned address'}
            </Label>
          </Wrapper>
        </PressableOpacity>
      </Wrapper>

      {/* ETA */}
      <Animated.View
        style={{
          opacity: etaAnim,
          transform: [
            {
              translateY: etaAnim.interpolate({
                inputRange: [-300, -100, 0, 100, 101],
                outputRange: [300, 0, 1, 0, 0],
              }),
              //   translateY: etaAnim.interpolate({
              //     inputRange: [0, 1],
              //     outputRange: [8, 0], // pequeño slide-up
              //   }),
            },
          ],
        }}>
        <Label style={styles.etaCaption}>
          Estimated arrival time based on your current location:
        </Label>

        <Wrapper style={GLOBAL_STYLES.row}>
          <Label style={styles.etaValue}>{estimatedTime?.text}.</Label>
        </Wrapper>
      </Animated.View>

      {/* Acciones */}
      <Animated.View
        style={{
          height: 150,
          transform: [
            {
              translateY: etaAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 15], // 0 : 150, 0.5 : 75, 1 : 0
              }),
            },
          ],
        }}>
        <Wrapper style={styles.rowNav}>
          <PressableOpacity
            disabled={isLoadingEstimatedTime}
            onPress={() => requestGpsPermission()}
            style={styles.btnOptionLocation}>
            <Label style={styles.btnOptionLocationText}>Estimate</Label>
            {isLoadingEstimatedTime ? (
              <IndicatorLoading
                containerStyle={{flex: 0}}
                activityIndicatorProps={{color: COLORS.white, size: 'small'}}
              />
            ) : (
              <Icon name="map-signs" color="white" type="solid" size={16} />
            )}
          </PressableOpacity>

          <PressableOpacity
            onPress={() => requestGpsPermission(true)}
            style={styles.btnOptionNavigation}>
            <Label style={styles.btnOptionLocationText}>Start Navigation</Label>
            {isLoadingEstimatedTime ? (
              <IndicatorLoading
                containerStyle={{flex: 0}}
                activityIndicatorProps={{color: COLORS.white, size: 'small'}}
              />
            ) : (
              <Icon
                name="location-arrow"
                color="white"
                type="solid"
                size={16}
              />
            )}
          </PressableOpacity>
        </Wrapper>

        <Wrapper style={styles.reportWrap}>
          <CustomMenu
            title="Report a problem"
            buttonStyle={styles.btnRp}
            buttonTextStyle={styles.btnOptionLocationText}
            icon={<Icon name="ban" color="white" type="solid" size={16} />}>
            <ReportLocationProblem />
          </CustomMenu>
        </Wrapper>

        <Wrapper style={styles.notesWrap}>
          <ScrollView
            style={styles.notesScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled">
            <Label style={[GLOBAL_STYLES.bold, styles.clientNameTitle]}>
              Location notes
            </Label>
            <Label style={styles.notesBody}>
              {typeAddress === AddressTypes.Shipper
                ? jobDetail?.shipper_comments ?? 'N/A'
                : jobDetail?.consignee_comments ?? 'N/A'}
            </Label>
          </ScrollView>
          <Wrapper style={styles.notesCtaWrap}>
            <PressableOpacity
              onPress={showLocationNotes}
              style={styles.btnLocationNotes}>
              <Label style={styles.btnOptionLocationText}>
                Add location notes
              </Label>
              <Icon name="sticky-note" color="white" type="solid" size={16} />
            </PressableOpacity>
          </Wrapper>
        </Wrapper>
      </Animated.View>

      {Platform.OS === 'ios' && (
        <MapAppBottomSheet
          ref={mapAppBottomSheetRef}
          title="Open location with"
          // message="Select the app you want to use"
          height={240}
        />
      )}
    </ScrollView>
  );
};

/** ─────────────────────────── Helpers ─────────────────────────── **/

function TabButton({
  icon,
  label,
  color,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableOpacity onPress={onPress} accessibilityRole="button">
      <Wrapper style={GLOBAL_STYLES.row}>
        <Icon name={icon} type="solid" size={14} color={color} />
        <Wrapper style={styles.tabTextWrap}>
          <Label style={[styles.tabText, {color}]}>{label}</Label>
          <Wrapper
            style={[styles.tabUnderline, active && styles.tabUnderlineActive]}
          />
        </Wrapper>
      </Wrapper>
    </PressableOpacity>
  );
}

/** ─────────────────────────── Styles ─────────────────────────── **/

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgWhite,
    minHeight: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 200,
  },

  /** Tabs */
  tabs: {
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabTextWrap: {marginLeft: 5, position: 'relative'},
  tabText: {fontSize: 14},
  tabUnderline: {
    position: 'absolute',
    width: '100%',
    bottom: -5,
    borderBottomWidth: 0,
    borderBottomColor: COLORS.primary,
  },
  tabUnderlineActive: {borderBottomWidth: 1},

  /** Map */
  mapWrap: {position: 'relative', width: '100%'},
  map: {width: '100%', height: 250, marginTop: 10},
  mapSpinner: {
    position: 'absolute',
    zIndex: 9999,
    alignSelf: 'center',
    top: 120,
  },
  mapOverlay: {
    backgroundColor: 'gray',
    opacity: 0.9,
    position: 'absolute',
    width: '100%',
    height: 250,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlayText: {fontWeight: 'bold', color: '#fff'},

  /** Where */
  whereRow: {width: '100%', marginTop: 5, alignItems: 'center'},
  where: {color: '#3C424A', fontSize: 16, fontWeight: 'bold'},
  whereBtn: {paddingLeft: 5, paddingRight: 80},
  textLocation: {
    color: COLORS.primary,
    fontSize: 13,
    paddingBottom: 0,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.primary,
    marginLeft: 5,
  },

  /** ETA & Actions */
  etaCaption: {color: '#3C424A', opacity: 0.82, fontSize: 12},
  etaValue: {color: '#3C424A', opacity: 0.82, fontSize: 12, fontWeight: 'bold'},
  actionsWrap: {height: 150, transform: [{translateY: 0}]},
  rowNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  btnOptionLocationText: {color: 'white', fontSize: 12, marginRight: 8},
  btnOptionLocation: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    marginRight: 2,
    alignSelf: 'flex-start',
  },
  btnOptionNavigation: {
    backgroundColor: '#00d090',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    marginRight: 2,
    alignSelf: 'flex-start',
  },
  reportWrap: {marginTop: 10, alignItems: 'center', alignSelf: 'center'},
  btnRp: {
    backgroundColor: '#C13737',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  /** Notes */
  notesWrap: {marginTop: 10},
  notesScroll: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '100%',
  },
  clientNameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.subtitleColor,
  },
  notesBody: {marginTop: 2, marginBottom: 25},
  notesCtaWrap: {
    marginTop: 5,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: -10,
  },
  btnLocationNotes: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ff9500',
  },
});
