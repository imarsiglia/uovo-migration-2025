import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useCallback, useMemo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
// import {removeAllStorageOffline} from '../utils/functions';
import {HomeFloatingAction} from '@components/floating/HomeFloatingAction';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';
import {Label} from '@components/commons/text/Label';
import {URL_API} from '@api/config/apiClient';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {SpinningIcon} from '@components/commons/spin/SpinningIcon';
import Icon from 'react-native-fontawesome-pro';
import useGeneralStore from '@store/general';
import {ParamListBase, TabNavigationState} from '@react-navigation/native';
import {
  useGetCalendar,
  useGetJobQueue,
  useGetTimeline,
} from '@api/hooks/HooksJobServices';
import {FILTER_WO_ACTIVE} from '@api/contants/constants';
import {useMinBusy} from '@hooks/useMinBusy';
import {useJobQueueStore} from '@store/jobqueue';
import {BackButton} from '@components/commons/buttons/BackButton';

const Tab = createMaterialTopTabNavigator();

export const TopsheetScreen = () => {
  const {
    isFilterActive,
    timelinePressed,
    setTimelinePressed,
    setActiveTab,
    activeTab,
  } = useGeneralStore();
  const selectedDate = useGeneralStore((d) => d.selectedDate);
  const {
    orderBy,
    serviceLocation,
    getValueByType,
    CLIENT,
    START_DATE,
    STATUS,
    WOTYPE,
    WO_NUMBER,
  } = useJobQueueStore();
  const [isRefetching, setIsRefetching] = useState(false);

  const {refetch: refetchCalendar} = useGetCalendar();
  const {refetch: refetchTimeline} = useGetTimeline(selectedDate);

  const filter = useMemo(() => {
    return getValueByType(orderBy);
  }, [getValueByType, CLIENT, START_DATE, STATUS, WOTYPE, WO_NUMBER, orderBy]);

  const {refetch: refetchJobQueue} = useGetJobQueue({
    orderBy,
    place: serviceLocation,
    filter: !isFilterActive ? filter : FILTER_WO_ACTIVE,
  });

  const loading = useMinBusy(isRefetching, 1000);

  const onPressTab = useCallback((state: TabNavigationState<ParamListBase>) => {
    setTimeout(() => {
      setActiveTab(state.index);
    }, 100);
  }, []);

  const onPressTimelineTab = useCallback(() => {
    setTimelinePressed(!timelinePressed);
  }, [timelinePressed]);

  const syncro = useCallback(() => {
    setIsRefetching(true);
    let refetchPromise: Promise<unknown>;
    switch (activeTab) {
      case 0: // timeline
        refetchPromise = Promise.all([refetchCalendar(), refetchTimeline()]);
        break;
      case 1: // jobqueue
        refetchPromise = refetchJobQueue();
        break;
      default:
        refetchPromise = Promise.resolve(); // evita que sea undefined
    }
    return refetchPromise.finally(() => setIsRefetching(false));
  }, [activeTab, refetchCalendar, refetchTimeline, refetchJobQueue]);

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[{flexGrow: 1, backgroundColor: COLORS.bgWhite}]}>
        <Wrapper style={styles.containerHeader}>
          <BackButton title="Home" onPress={() => {}} />
          <Wrapper style={{flexDirection: 'row', alignItems: 'center'}}>
            <PressableOpacity
              disabled={false}
              onPress={syncro}
              style={[styles.btnSync, {backgroundColor: COLORS.primary}]}>
              <SpinningIcon size={17} spin={loading} />
            </PressableOpacity>
          </Wrapper>
        </Wrapper>

        <View style={{flex: 1, flexGrow: 1, height: '100%', width: '100%'}}>
          <Tab.Navigator
            initialRouteName="Resume"
            screenListeners={{
              state: (e) => {
                onPressTab(e.data.state);
              },
            }}
            screenOptions={{
              tabBarScrollEnabled: true,
              tabBarLabelStyle: styles.tabBarLabelStyle,
              swipeEnabled: false,
              tabBarInactiveTintColor: COLORS.gray,
              tabBarGap: 0,
              tabBarActiveTintColor: COLORS.terteary,
              tabBarItemStyle: {width: 'auto', paddingHorizontal: 8},
              tabBarStyle: styles.tabBarStyle,
              tabBarIndicatorStyle: {
                backgroundColor: COLORS.terteary,
                marginBottom: 10,
              },
              tabBarPressColor: COLORS.background,
            }}>
            <Tab.Screen
              name="Resume"
              component={() => (
                <Wrapper style={{backgroundColor: 'yellow', flex: 1}}>
                  <Label>Resume</Label>
                </Wrapper>
              )}
              options={{tabBarLabel: 'Resume'}}
              listeners={{
                tabPress: onPressTimelineTab,
              }}
            />
            <Tab.Screen
              name="Location"
              component={() => <></>}
              options={{tabBarLabel: 'Location'}}
            />
            <Tab.Screen
              name="Inventory"
              component={() => <></>}
              options={{tabBarLabel: 'Inventory'}}
            />
            <Tab.Screen
              name="Tasks"
              component={() => <></>}
              options={{tabBarLabel: 'Tasks'}}
            />
            <Tab.Screen
              name="Team"
              component={() => <></>}
              options={{tabBarLabel: 'Team'}}
            />
          </Tab.Navigator>
        </View>
      </Wrapper>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
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
    // fontSize: 14,
    textTransform: 'capitalize',
    flexWrap: 'nowrap',
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#9e9e9e',
    fontWeight: 'normal',
  },
  tabBarStyle: {
    paddingHorizontal: 0,
    elevation: 1,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderEndWidth: 0.5,
    borderStartWidth: 0.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.border,
  },
});
