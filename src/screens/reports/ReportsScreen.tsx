import {
  useGetResumeConditionCheck,
  useGetResumeConditionReport,
} from '@api/hooks/HooksReportServices';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import useReportStore from '@store/reports';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import {ReportsConditionCheck} from './ReportsConditionCheck';
import {ReportsConditionReport} from './ReportsConditionReport';
import {RoutesNavigation} from '@navigation/types';
import OfflineValidation from '@components/offline/OfflineValidation';
import {useHasPendingSync} from '@hooks/useSyncIndicator';
import {ENTITY_TYPES} from '@api/contants/constants';
// import ReportsConditionCheck from './reportsConditionCheck';
// import ReportsConditionReport from './reportsConditionReport';
// import OfflineValidation from '../components/offline/OfflineValidation';

const Tab = createMaterialTopTabNavigator();

export const ReportsScreen = () => {
  const {goBack, navigate} = useCustomNavigation();

  const {setConditionReportList, setConditionCheckList} = useReportStore();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const {
    data: conditionReport,
    isLoading: isLoadingConditionReport,
    refetch: refetchConditionReport,
    isRefetching: isRefetchingConditionReport,
  } = useGetResumeConditionReport({
    idJob: jobDetail!.id,
  });

  const {
    data: conditionCheck,
    isLoading: isLoadingConditionCheck,
    refetch: refetchConditionCheck,
    isRefetching: isRefetchingConditionCheck,
  } = useGetResumeConditionCheck({
    idJob: jobDetail!.id,
  });

  const hasConditionReportOffline = useHasPendingSync(
    ENTITY_TYPES.CONDITION_REPORT,
    jobDetail?.id,
  );

  const hasConditionCheckOffline = useHasPendingSync(
    ENTITY_TYPES.CONDITION_CHECK,
    jobDetail?.id,
  );

  useEffect(() => {
    if (conditionReport?.data) {
      setConditionReportList(conditionReport.data);
    }
  }, [conditionReport?.data, setConditionReportList]);

  useEffect(() => {
    if (conditionCheck?.data) {
      setConditionCheckList(conditionCheck.data);
    }
  }, [conditionCheck?.data, setConditionCheckList]);

  //tabs index
  const [tabIndex, setTabIndex] = useState(0);

  const initAddCondition = useCallback(() => {
    if (tabIndex == 0) {
      navigate(RoutesNavigation.ConditionReport, {
        fromReports: true,
      });
    } else {
      navigate(RoutesNavigation.ConditionCheck, {
        fromReports: true,
      });
    }
  }, [tabIndex]);

  const isLoading = useMemo(() => {
    return isLoadingConditionReport || isLoadingConditionCheck;
  }, [isLoadingConditionReport, isLoadingConditionReport]);

  const isRefetching = useMemo(() => {
    return (
      isLoadingConditionReport ||
      isLoadingConditionCheck ||
      isRefetchingConditionReport ||
      isRefetchingConditionCheck
    );
  }, [
    isLoadingConditionReport,
    isLoadingConditionCheck,
    isRefetchingConditionReport,
    isRefetchingConditionCheck,
  ]);

  return (
    <Wrapper style={[styles.container]}>
      {isRefetching && <GeneralLoading />}

      <Wrapper style={[GLOBAL_STYLES.bgwhite, {backgroundColor: 'white'}]}>
        <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton title="Tasks" onPress={goBack} />

          <Wrapper style={GLOBAL_STYLES.row}>
            <PressableOpacity
              onPress={() => initAddCondition()}
              style={GLOBAL_STYLES.btnOptTop}>
              <Icon name="plus" color="white" type="solid" size={15} />
            </PressableOpacity>
          </Wrapper>
        </Wrapper>

        <Wrapper style={[styles.lateralPadding, GLOBAL_STYLES.row]}>
          <Label
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Reports
          </Label>
        </Wrapper>
      </Wrapper>

      {!isLoading && (
        <Tab.Navigator
          initialRouteName={
            tabIndex == 0 ? 'Condition report' : 'Condition check'
          }
          screenListeners={{
            state: (e) => {
              setTabIndex(e.data.state.index);
            },
          }}
          //   optimizationsEnabled={true}
          backBehavior="none"
          screenOptions={{
            lazy: true,
            tabBarInactiveTintColor: COLORS.gray,
            tabBarGap: 0,
            tabBarActiveTintColor: COLORS.terteary,
            tabBarItemStyle: {
              paddingTop: 10,
              justifyContent: 'center',
            },
            tabBarStyle: {
              elevation: 1,
              height: 40,
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
              backgroundColor: 'tranparent',
            },
            tabBarIndicatorStyle: {backgroundColor: COLORS.terteary},
            tabBarPressColor: COLORS.white,
          }}>
          <Tab.Screen
            name="Condition report"
            component={ReportsConditionReport}
            options={{
              tabBarLabel: ({color}) => (
                <Wrapper style={styles.containerTab}>
                  <OfflineValidation offline={hasConditionReportOffline} />
                  <Label allowFontScaling={false} style={{color: color}}>
                    Condition report
                  </Label>
                  <Wrapper
                    style={[
                      styles.containerQuantity,
                      {backgroundColor: color},
                    ]}>
                    <Label style={styles.quantity}>
                      {conditionReport?.total ?? 0}
                    </Label>
                  </Wrapper>
                </Wrapper>
              ),
            }}
          />
          <Tab.Screen
            name="Condition check"
            component={ReportsConditionCheck}
            options={{
              tabBarLabel: ({color}) => (
                <Wrapper style={styles.containerTab}>
                  <OfflineValidation offline={hasConditionCheckOffline} />
                  <Label allowFontScaling={false} style={{color: color}}>
                    Condition check
                  </Label>
                  <Wrapper
                    style={[
                      styles.containerQuantity,
                      {backgroundColor: color},
                    ]}>
                    <Label style={styles.quantity}>
                      {conditionCheck?.total ?? 0}
                    </Label>
                  </Wrapper>
                </Wrapper>
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.bgWhite,
  },
  topsheet: {
    color: '#3a3a3a',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  containerQuantity: {
    width: 20,
    height: 20,
    padding: 0,
    borderRadius: 50,
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 10,
    textAlignVertical: 'center',
    textAlign: 'center',
    color: 'white',
  },
  containerTab: {
    height: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    gap: 5,
  },
});
