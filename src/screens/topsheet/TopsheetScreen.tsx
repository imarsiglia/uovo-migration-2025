import {FILTER_WO_ACTIVE} from '@api/contants/constants';
import {useGetJobQueue, useGetTopsheet} from '@api/hooks/HooksJobServices';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {SpinningIcon} from '@components/commons/spin/SpinningIcon';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {TeamAvatars} from '@components/jobs/crew/TeamAvatars';
import TopSheetSkeleton from '@components/skeletons/TopSheetSkeleton';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useMinBusy} from '@hooks/useMinBusy';
import {useOnline} from '@hooks/useOnline';
import {RootStackParamList, RoutesNavigation} from '@navigation/types';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  ParamListBase,
  TabNavigationState,
  useNavigation,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import useGeneralStore from '@store/general';
import {useJobQueueStore} from '@store/jobqueue';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {deriveVisualState} from '@utils/functions';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {ResumeTopsheet} from './ResumeTopsheet';
import { LocationTopsheet } from './LocationTopsheet';

const Tab = createMaterialTopTabNavigator();

type Props = NativeStackScreenProps<RootStackParamList, 'Topsheet'>;

export const TopsheetScreen = ({route}: Props) => {
  const {online} = useOnline();
  const {navigate, goBack} = useCustomNavigation();
  const {setJobDetail, setActiveTab} = useTopSheetStore();
  const loading = false;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    params: {id, queue},
  } = route;

  const {data: jobDetail, isLoading} = useGetTopsheet({
    id,
    queue,
  });

  useEffect(() => {
    setJobDetail(jobDetail);

    return () => {
      setJobDetail(undefined);
    };
  }, [jobDetail]);

  // const loading = useMinBusy(isRefetching, 1000);

  const syncro = useCallback(() => {
    // setIsRefetching(true);
    // let refetchPromise: Promise<unknown>;
    // switch (activeTab) {
    //   case 0: // timeline
    //     refetchPromise = Promise.all([refetchCalendar(), refetchTimeline()]);
    //     break;
    //   case 1: // jobqueue
    //     refetchPromise = refetchJobQueue();
    //     break;
    //   default:
    //     refetchPromise = Promise.resolve(); // evita que sea undefined
    // }
    // return refetchPromise.finally(() => setIsRefetching(false));
    // }, [activeTab, refetchCalendar, refetchTimeline, refetchJobQueue]);
  }, []);

  const {visual, label} = useMemo(
    () =>
      deriveVisualState({
        offline: !online,
        currentClockInStatus: jobDetail?.current_clock_in?.status,
        woStatus: jobDetail?.wo_status,
      }),
    [online, jobDetail?.current_clock_in?.status, jobDetail?.wo_status],
  );

  const goToTeamMember = useCallback(() => {
    navigate(RoutesNavigation.Topsheet, {
      id,
      queue,
      screen: 'TasksTopSheet',
    } as never);
  }, [jobDetail?.id]);

  const onPressTab = useCallback((tab: TabNavigationState<ParamListBase>) => {
    setActiveTab(tab.index);
  }, [] )

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[{flexGrow: 1, backgroundColor: COLORS.bgWhite}]}>
        <Wrapper style={styles.containerHeader}>
          <BackButton title="Home" onPress={goBack} />
          <Wrapper style={styles.containerBtnTop}>
            <PressableOpacity
              disabled={false}
              onPress={syncro}
              style={GLOBAL_STYLES.btnOptTop}>
              <SpinningIcon size={17} spin={loading} />
            </PressableOpacity>

            {!loading && true && (
              <PressableOpacity
                onPress={() => navigate('VisualizePdf')}
                style={GLOBAL_STYLES.btnOptTop}>
                <Icon name="file-pdf" color="white" type="solid" size={15} />
              </PressableOpacity>
            )}

            <PressableOpacity
              onPress={() => navigate('DigitalId', {member: false})}
              style={GLOBAL_STYLES.btnOptTop}>
              <Icon name="id-badge" color="white" type="solid" size={15} />
            </PressableOpacity>
          </Wrapper>
        </Wrapper>

        {isLoading ? (
          <TopSheetSkeleton />
        ) : (
          <>
            <Wrapper style={styles.containerTopsheet}>
              <Wrapper
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Label
                  style={[
                    GLOBAL_STYLES.title,
                    GLOBAL_STYLES.bold,
                    styles.topsheet,
                  ]}>
                  {jobDetail?.netsuite_order}
                </Label>
                <Wrapper
                  style={[styles.containerState, containerByVisual[visual]]}>
                  <Label style={[{fontSize: 12}, textByVisual[visual]]}>
                    {label}
                  </Label>
                </Wrapper>
              </Wrapper>
              <TeamAvatars
                crew={jobDetail?.crew ?? []}
                onPress={goToTeamMember}
              />
            </Wrapper>

            <View style={styles.container}>
              <Tab.Navigator
                initialRouteName="ResumeTopSheet"
                screenListeners={{
                  state: (e) => {
                    onPressTab(e.data.state);
                  },
                }}
                screenOptions={{
                  tabBarScrollEnabled: true,
                  tabBarLabelStyle: styles.tabBarLabelStyle,
                  swipeEnabled: false,
                  tabBarInactiveTintColor: COLORS.tobTapTextInactive,
                  tabBarGap: 0,
                  tabBarActiveTintColor: COLORS.terteary,
                  tabBarItemStyle: {width: 'auto', paddingHorizontal: 8},
                  tabBarStyle: styles.tabBarStyle,
                  tabBarIndicatorStyle: {
                    backgroundColor: COLORS.terteary,
                    marginBottom: 10,
                    height: 0.5,
                  },
                  tabBarPressColor: COLORS.background,
                  lazy: true,
                  tabBarAllowFontScaling: false,
                }}>
                <Tab.Screen
                  name="ResumeTopSheet"
                  component={ResumeTopsheet}
                  options={{tabBarLabel: 'Resume'}}
                />
                <Tab.Screen
                  name="LocationTopSheet"
                  component={LocationTopsheet}
                  options={{tabBarLabel: 'Location'}}
                />
                <Tab.Screen
                  name="InventoryTopSheet"
                  component={() => <></>}
                  options={{tabBarLabel: 'Inventory'}}
                />
                <Tab.Screen
                  name="TasksTopSheet"
                  component={() => <></>}
                  options={{tabBarLabel: 'Tasks'}}
                />
                <Tab.Screen
                  name="TeamTopSheet"
                  component={() => <></>}
                  options={{tabBarLabel: 'Team'}}
                />
              </Tab.Navigator>
            </View>
          </>
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
    backgroundColor: 'white',
    paddingLeft: 5,
    paddingRight: 10,
  },
  tabBarLabelStyle: {
    textTransform: 'capitalize',
    flexWrap: 'nowrap',
    paddingHorizontal: 0,
    fontSize: 15,
    fontWeight: 'normal',
    marginVertical: 0,
  },
  tabBarStyle: {
    paddingHorizontal: 0,
    elevation: 1,
    borderBottomStartRadius: 5,
    borderBottomEndRadius: 5,
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderEndWidth: 0.5,
    borderStartWidth: 0.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.border,
  },
  containerBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  container: {
    flex: 1,
    flexGrow: 1,
    height: '100%',
    width: '100%',
  },
  topsheet: {
    color: COLORS.titleColor,
  },
  containerTopsheet: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  offline: {
    backgroundColor: 'black',
  },
  inProgress: {
    backgroundColor: '#DFFAF4',
  },
  paused: {
    backgroundColor: '#F7F5F4',
  },
  finished: {
    backgroundColor: '#FFDCDC',
  },
  text_offline: {
    color: 'white',
  },
  inProgress_text: {
    color: '#50E3C2',
  },
  paused_text: {
    color: '#959595',
  },
  finished_text: {
    color: '#FF6161',
  },
  containerState: {
    borderRadius: 100,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
});

const containerByVisual: Record<
  'offline' | 'inProgress' | 'paused' | 'finished',
  any
> = {
  offline: styles.offline,
  inProgress: styles.inProgress,
  paused: styles.paused,
  finished: styles.finished,
};

const textByVisual: Record<
  'offline' | 'inProgress' | 'paused' | 'finished',
  any
> = {
  offline: styles.text_offline,
  inProgress: styles.inProgress_text,
  paused: styles.paused_text,
  finished: styles.finished_text,
};
