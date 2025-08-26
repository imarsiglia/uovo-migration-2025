import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useCallback} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
// import {useTabHomeContext} from '../provider/TabHomeContext';
// import {useUserContext} from '../provider/UserContext';
// import mstyles from '../styles/styles';
// import {COLORS, URL_API} from '../utils/constants';
// import {fetchData} from '../utils/fetch';
// import {removeAllStorageOffline} from '../utils/functions';
// import {isInternet} from '../utils/internet';
// import {
//   getFromStorageOffline,
//   IDS_INVENTORY_KEY_STORAGE,
//   OFFLINE_MATERIALS_KEY_STORAGE,
//   PACKING_DETAILS_KEY_STORAGE,
//   removeMultiFromStorage,
//   saveToStorageOffline,
//   TOKEN_KEY_STORAGE,
//   USER_INFO_KEY_STORAGE,
// } from '../utils/storage';
// import JobQueueView from './home/JobQueueView';
// import TimelineView from './home/TimelineView';
import {useSharedValue, withTiming} from 'react-native-reanimated';
// import NationalShuttleView from './home/NationalShuttleView';
import {HomeFloatingAction} from '@components/floating/HomeFloatingAction';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';
import {Label} from '@components/commons/text/Label';
import {URL_API} from '@api/config/apiClient';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {SpinningIcon} from '@components/commons/spin/SpinningIcon';
import {TimelineView} from './TimelineView';
import Icon from 'react-native-fontawesome-pro';
import useGeneralStore from '@store/general';
import {ParamListBase, TabNavigationState} from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export const HomeScreen = () => {
  const {isFilterActive, timelinePressed, setTimelinePressed, setActiveTab} =
    useGeneralStore();

  // useEffect(() => {
  //   createIdsInventory();
  //   getMaterials();
  //   getPackingDetails();
  // }, []);

  // async function createIdsInventory() {
  //   var stringIdsInventory = await getFromStorageOffline(
  //     IDS_INVENTORY_KEY_STORAGE,
  //   );
  //   if (!stringIdsInventory) {
  //     saveToStorageOffline(IDS_INVENTORY_KEY_STORAGE, '[]');
  //   }
  // }

  // async function getMaterials() {
  //   const isConnected = await isInternet();
  //   if (isConnected) {
  //     const response: any = await fetchData.Get(
  //       'resources/material/query?downloadAll=1&idJob=&filter=',
  //     );
  //     if (response.ok) {
  //       if (response.data.message == 'SUCCESS') {
  //         var stringMaterials = JSON.stringify(response.data.body.data);
  //         await saveToStorageOffline(
  //           OFFLINE_MATERIALS_KEY_STORAGE,
  //           stringMaterials,
  //         );
  //       }
  //     }
  //   }
  // }

  // async function getPackingDetails() {
  //   const isConnected = await isInternet();
  //   if (isConnected) {
  //     const response: any = await fetchData.Get(
  //       'resources/conditionreport/load/packingdetail?query=',
  //     );
  //     if (response.ok) {
  //       if (response.data.message == 'SUCCESS') {
  //         props.dispatch(
  //           InventoryActions.copyPackingDetails(response.data.body.data),
  //         );
  //         var packDetString = JSON.stringify(response.data.body.data);
  //         await saveToStorageOffline(
  //           PACKING_DETAILS_KEY_STORAGE,
  //           packDetString,
  //         );
  //       }
  //     }
  //   } else {
  //     var packDetString: string = await getFromStorageOffline(
  //       PACKING_DETAILS_KEY_STORAGE,
  //     );
  //     if (packDetString) {
  //       var packDetJson = JSON.parse(packDetString);
  //       props.dispatch(InventoryActions.copyPackingDetails(packDetJson));
  //     }
  //   }
  // }

  const onPressTab = useCallback((state: TabNavigationState<ParamListBase>) => {
    Alert.alert('hola');
    setTimeout(() => {
      setActiveTab(state.index);
    }, 100);
  }, []);

  const onPressTimelineTab = useCallback(() => {
    setTimelinePressed(!timelinePressed);
  }, [timelinePressed]);

  const syncro = useCallback(() => {}, []);

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[{flexGrow: 1, backgroundColor: COLORS.bgWhite}]}>
        <Wrapper style={GLOBAL_STYLES.bgwhite}>
          <Wrapper style={styles.containerHeader}>
            <Label
              style={styles.titleHeader}
              onLongPress={() => Alert.alert('Server', URL_API)}>
              Home
            </Label>
            <Wrapper style={{flexDirection: 'row', alignItems: 'center'}}>
              <PressableOpacity
                disabled={false}
                onPress={syncro}
                style={[styles.btnSync, {backgroundColor: COLORS.primary}]}>
                <SpinningIcon size={17} spin />
              </PressableOpacity>
            </Wrapper>
          </Wrapper>
        </Wrapper>

        <View style={{flex: 1, flexGrow: 1, height: '100%', width: '100%'}}>
          <Tab.Navigator
            initialRouteName="Timeline"
            screenListeners={{
              state: (e) => {
                onPressTab(e.data.state);
              },
            }}
            screenOptions={{
              tabBarLabelStyle: styles.tabBarLabelStyle,
              swipeEnabled: false,
              tabBarInactiveTintColor: COLORS.gray,
              tabBarGap: 0,
              tabBarActiveTintColor: COLORS.terteary,
              tabBarItemStyle: {paddingHorizontal: 0},
              tabBarStyle: {paddingHorizontal: 0, elevation: 1},
              tabBarIndicatorStyle: {backgroundColor: COLORS.terteary},
              tabBarPressColor: COLORS.background,
            }}>
            <Tab.Screen
              name="Timeline"
              component={TimelineView}
              options={{tabBarLabel: 'Timeline'}}
              listeners={{
                tabPress: onPressTimelineTab,
              }}
            />
            <Tab.Screen
              name="JobQueue"
              component={() => <></>}
              options={{tabBarLabel: 'Job Queue'}}
            />
            <Tab.Screen
              name="NationalShuttle"
              component={() => <></>}
              options={{tabBarLabel: 'National Shuttle'}}
            />
          </Tab.Navigator>
        </View>

        <HomeFloatingAction />

        {isFilterActive && (
          <View
            style={[
              styles.floatingInfoFilter,
              {flexDirection: 'row', alignItems: 'center'},
            ]}>
            <Icon name="exclamation" size={15} color="orange" type="solid" />
            <Label allowFontScaling={false} style={{color: '#000000'}}>
              You are currently on a filtered view for paused jobs
            </Label>
          </View>
        )}
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',
  },
  titleHeader: {
    fontWeight: 'bold',
    color: COLORS.titleColor,
    fontSize: 30,
  },
  btnSync: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingInfoFilter: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#dbdbdb',
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    elevation: 10,
  },
  tabBarLabelStyle: {
    fontSize: 14,
    textTransform: 'capitalize',
    flexWrap: 'nowrap',
    paddingHorizontal: 0,
  },
});
