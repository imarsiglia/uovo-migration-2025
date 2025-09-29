import {useGetTopsheet} from '@api/hooks/HooksJobServices';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {SpinningIcon} from '@components/commons/spin/SpinningIcon';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {TeamAvatars} from '@components/jobs/crew/TeamAvatars';
import TopSheetSkeleton from '@components/skeletons/TopSheetSkeleton';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {
  RootStackParamList,
  RoutesNavigation,
  TopSheetRoutesNavigation,
} from '@navigation/types';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {ParamListBase, TabNavigationState} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {deriveVisualGroupState, deriveVisualUserState} from '@utils/functions';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {Alert, Animated, StyleSheet, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {LocationTopsheet} from './LocationTopsheet';
import {ResumeTopsheet} from './ResumeTopsheet';
import {TaskTopsheet} from './TaskTopsheet';
import {TeamTopsheet} from './TeamTopsheet';
import {ClockinButton} from '@components/clockin/ClockinButton';
import {InventoryTopsheet} from './InventoryTopsheet';
import {GLOBAL_FONT_SIZE_MULTIPLIER_MD} from '@api/contants/constants';

const Tab = createMaterialTopTabNavigator();

type Props = NativeStackScreenProps<RootStackParamList, 'Topsheet'>;

export const TopsheetScreen = ({route}: Props) => {
  const {online} = useOnline();
  const {navigate, goBack} = useCustomNavigation();
  const {setJobDetail, setActiveTab, activeTab, setIsJobQueue} =
    useTopSheetStore();

  const {
    params: {id, queue, nsItemId},
  } = route;

  const {
    data: jobDetail,
    isLoading,
    refetch,
    isRefetching,
  } = useGetTopsheet({
    id,
    queue,
    enabled: true,
  });

  const heightAnim = useRef(new Animated.Value(36)).current;
  const translateY = useRef(new Animated.Value(0)).current; // empieza fuera de pantalla
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (jobDetail) {
      setJobDetail(jobDetail);
      if (jobDetail?.id && nsItemId) {
        navigate(RoutesNavigation.ItemDetail, {
          id: nsItemId,
          isNS: true,
        });
      }
    }
    return () => {
      setJobDetail(undefined);
    };
  }, [setJobDetail, jobDetail]);

  useEffect(() => {
    if (setIsJobQueue) {
      setIsJobQueue(queue);
      return () => {
        setIsJobQueue(undefined);
      };
    }
  }, [setIsJobQueue, queue]);

  useEffect(() => {
    if (activeTab == 0) {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: -30,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [activeTab]);

  // const loading = useMinBusy(isRefetching, 1000);

  const syncro = useCallback(() => {
    refetch();
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
  }, [refetch]);

  const {visual: visualGroupStatus, label: labelGroupStatus} = useMemo(
    () =>
      deriveVisualGroupState({
        offline: !online,
        woStatus: jobDetail?.wo_status,
      }),
    [online, jobDetail?.wo_status],
  );

  const {visual: visualUserStatus, label: labelUserStatus} = useMemo(
    () =>
      deriveVisualUserState({
        currentClockInStatus: jobDetail?.current_clock_in?.status,
      }),
    [jobDetail?.current_clock_in?.status],
  );

  const goToTeamMember = useCallback(() => {
    navigate(RoutesNavigation.Topsheet, {
      id,
      queue,
      screen: TopSheetRoutesNavigation.Team.name,
    } as never);
  }, [jobDetail?.id]);

  const onPressTab = useCallback((tab: TabNavigationState<ParamListBase>) => {
    setActiveTab(tab.index);
  }, []);

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36], // Ajusta 60 por la altura real de tu componente
  });

  return (
    <Wrapper style={GLOBAL_STYLES.safeAreaLight}>
      <Wrapper style={[{flexGrow: 1, backgroundColor: COLORS.bgWhite}]}>
        <Wrapper style={styles.containerHeader}>
          <BackButton title="Home" onPress={goBack} />
          <Wrapper style={styles.containerBtnTop}>
            <PressableOpacity
              disabled={isLoading || isRefetching}
              onPress={syncro}
              style={GLOBAL_STYLES.btnOptTop}>
              <SpinningIcon size={16} spin={isRefetching} />
            </PressableOpacity>

            {jobDetail?.use_bol && (
              <PressableOpacity
                disabled={isLoading}
                onPress={() => navigate(RoutesNavigation.VisualizeBOL)}
                style={GLOBAL_STYLES.btnOptTop}>
                <Icon name="file-pdf" color="white" type="solid" size={15} />
              </PressableOpacity>
            )}

            <PressableOpacity
              disabled={isLoading}
              onPress={() =>
                navigate(RoutesNavigation.DigitalId, {member: false})
              }
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
                <Wrapper style={styles.containerWoStatus}>
                  <Label
                    style={styles.textStatus}
                    maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_MD}>
                    Group status
                  </Label>
                  <Wrapper
                    style={[
                      styles.containerState,
                      containerByVisual[visualGroupStatus],
                    ]}>
                    <Label
                      style={[{fontSize: 12}, textByVisual[visualGroupStatus]]}>
                      {labelGroupStatus}
                    </Label>
                  </Wrapper>
                </Wrapper>

                {visualUserStatus && (
                  <Wrapper style={styles.containerWoStatus}>
                    <Label
                      style={styles.textStatus}
                      maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_MD}>
                      User status
                    </Label>
                    <Wrapper
                      style={[
                        styles.containerState,
                        containerByVisual[visualUserStatus],
                      ]}>
                      <Label
                        style={[
                          {fontSize: 12},
                          textByVisual[visualUserStatus],
                        ]}>
                        {labelUserStatus}
                      </Label>
                    </Wrapper>
                  </Wrapper>
                )}
              </Wrapper>
              {jobDetail?.crew?.length! > 0 && (
                <Animated.View
                  style={{
                    transform: [{translateY}],
                    opacity,
                    height: animatedHeight,
                    overflow: 'hidden',
                  }}>
                  <TeamAvatars
                    crew={jobDetail!.crew}
                    onPress={goToTeamMember}
                  />
                </Animated.View>
              )}
            </Wrapper>

            <View style={styles.container}>
              <Tab.Navigator
                initialRouteName={TopSheetRoutesNavigation.Resume.name}
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
                  name={TopSheetRoutesNavigation.Resume.name}
                  options={{tabBarLabel: TopSheetRoutesNavigation.Resume.label}}
                  component={ResumeTopsheet}
                />
                <Tab.Screen
                  name={TopSheetRoutesNavigation.Location.name}
                  options={{
                    tabBarLabel: TopSheetRoutesNavigation.Location.label,
                  }}
                  component={LocationTopsheet}
                />
                <Tab.Screen
                  name={TopSheetRoutesNavigation.Inventory.name}
                  options={{
                    tabBarLabel: TopSheetRoutesNavigation.Inventory.label,
                  }}
                  component={InventoryTopsheet}
                />
                <Tab.Screen
                  name={TopSheetRoutesNavigation.Tasks.name}
                  options={{tabBarLabel: TopSheetRoutesNavigation.Tasks.label}}
                  component={TaskTopsheet}
                />
                <Tab.Screen
                  name={TopSheetRoutesNavigation.Team.name}
                  options={{tabBarLabel: TopSheetRoutesNavigation.Team.label}}
                  component={TeamTopsheet}
                />
              </Tab.Navigator>
            </View>

            <Wrapper
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                paddingVertical: 5,
                backgroundColor: 'white',
                paddingHorizontal: 10,
              }}>
              <ClockinButton />
            </Wrapper>
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
  textStatus: {
    fontSize: 10,
    marginTop: 2,
    color: '#2f2f2f',
  },
  containerWoStatus: {
    alignItems: 'center',
    gap: 5,
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
