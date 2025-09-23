import {
  PAUSED_STATUS,
  QUERY_KEYS,
  STARTED_STATUS,
} from '@api/contants/constants';
import {
  useDeleteNote,
  useGetLaborReports,
  useGetNotes,
  useRegisterLaborReport,
} from '@api/hooks/HooksTaskServices';
import {LaborReportType, NoteType} from '@api/types/Task';
import {ClockinButtonLaborReport} from '@components/clockin/ClockinButtonLaborReport';
import {BackButton} from '@components/commons/buttons/BackButton';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {
  SwipeableListProvider,
  SwipeableRow,
} from '@components/commons/swipeable/SwipeableRow';
import {Label} from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getFormattedDate} from '@utils/functions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useMemo} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
// import OfflineValidation from '../components/offline/OfflineValidation';

export const LaborReportScreen = () => {
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const toClockout = useTopSheetStore((d) => d.toClockout);
  const isJobQueue = useTopSheetStore((d) => d.isJobQueue);
  const {goBack, navigate} = useCustomNavigation();
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob: jobDetail!.id}],
    [QUERY_KEYS.TOPSHEET, {id: jobDetail!.id, queue: isJobQueue}],
  ]);

  const {
    data: list,
    isLoading,
    isRefetching,
    refetch,
  } = useGetLaborReports({
    idJob: jobDetail!.id,
    toClockout: toClockout!,
  });

  const {mutateAsync} = useRegisterLaborReport();

  const preventEditCurrentClock = useMemo(() => {
    return (
      jobDetail?.current_clock_in?.status == STARTED_STATUS ||
      jobDetail?.current_clock_in?.status == PAUSED_STATUS
    );
  }, [jobDetail?.current_clock_in]);

  const initRemove = useCallback(
    ({id, labor_code, worked_hour}: LaborReportType) => {
      showDialog({
        modalVisible: true,
        title: 'Delete',
        cancelable: true,
        message: (
          <Wrapper
            style={{flexDirection: 'column', gap: 10, alignItems: 'center'}}>
            <Label style={GLOBAL_STYLES.subtitleModalClockOut}>
              Labor Code: {labor_code?.description}
              {'\n'}
              Worked hours: {worked_hour?.substring(0, 5)}
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Are you sure you want to delete the labor report?
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Once finished you will not be able to make changes.
            </Label>
          </Wrapper>
        ),
        type: 'warning',
        onConfirm: () => {
          showDialog({
            modalVisible: false,
          });
          loadingWrapperPromise(
            mutateAsync({
              idJob: jobDetail!.id,
              queue: isJobQueue!,
              confirm: 0,
              preventEditCurrentClock,
              list:
                list
                  ?.filter((x) => x.id !== id)
                  ?.map((item) => ({
                    ...item,
                    laborCode: item.labor_code?.id,
                    addedManually: item.added_manually,
                    workedHours: item.worked_hour,
                    userName: item.user_name,
                  })) ?? [],
            })
              .then((d) => {
                if (d) {
                  refetch();
                  refetchAll();
                  showToastMessage('Labor report removed successfully');
                } else {
                  showErrorToastMessage('Error while deleting labor report');
                }
              })
              .catch(() =>
                showErrorToastMessage('Error while deleting labor report'),
              ),
          );
        },
      });
    },
    [
      list,
      showDialog,
      jobDetail,
      isJobQueue,
      refetch,
      refetchAll,
      preventEditCurrentClock,
    ],
  );

  const initEdit = useCallback(
    (item: LaborReportType) => {
      navigate(RoutesNavigation.AddLaborReport, {
        item,
      });
    },
    [navigate],
  );

  const initCreate = useCallback(() => {
    navigate(RoutesNavigation.AddLaborReport);
  }, [navigate]);

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<LaborReportType>) => {
      const circleColor = index % 2 === 0 ? '#3ABD6C' : '#EEA32D';
      return (
        <View style={[styles.containerNotification]}>
          <SwipeableRow
            rightActions={(close) => (
              <>
                <TouchableOpacity
                  style={styles.rightActionsEdit}
                  onPress={() => {
                    close();
                    initEdit(item);
                  }}>
                  <Icon name="pen" size={25} color="white" type="solid" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rightActions}
                  onPress={() => {
                    close();
                    initRemove(item);
                  }}>
                  <Icon name="trash-alt" size={25} color="white" type="solid" />
                </TouchableOpacity>
              </>
            )}>
            <View style={styles.viewNotification}>
              <View style={styles.viewDescNotification}>
                <Text style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
                  {item.worked_hour?.substring(0, 5)}
                </Text>
                <Text style={[GLOBAL_STYLES.bold, styles.titleNotification]}>
                  {item.user_name}
                </Text>
                <Wrapper style={{flexDirection: 'row', gap: 3}}>
                  <Text
                    style={[GLOBAL_STYLES.bold, styles.subtitleNotification]}>
                    Labor Code
                  </Text>
                  <Text style={styles.subtitleNotification}>
                    {item.labor_code?.description}
                  </Text>
                </Wrapper>
                <Wrapper style={{flexDirection: 'row', gap: 3}}>
                  <Text
                    style={[GLOBAL_STYLES.bold, styles.subtitleNotification]}>
                    Timestamp
                  </Text>
                  <Text style={styles.subtitleNotification}>
                    {getFormattedDate(item.clock_in, 'YYYY/MM/DD [•] HH:mm A')}
                  </Text>
                </Wrapper>
              </View>
            </View>
          </SwipeableRow>
        </View>
      );
    },
    [initEdit, initRemove],
  );

  return (
    <View style={styles.container}>
      {isLoading && <GeneralLoading />}

      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton title="Tasks" onPress={goBack} />

          <View style={GLOBAL_STYLES.row}>
            <TouchableOpacity
              onPress={initCreate}
              style={GLOBAL_STYLES.btnOptTop}>
              <Icon name="plus" color="white" type="solid" size={15} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            GLOBAL_STYLES.lateralPadding,
            GLOBAL_STYLES.row,
            {gap: 5, alignItems: 'center'},
          ]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Labor report
          </Text>
          {/* <OfflineValidation id={props.jobDetail.id} offline={[NOTES_OFFLINE_VALIDATION]}/> */}
        </View>
      </View>

      <MinRoundedView />

      <SwipeableListProvider>
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(it) => it.id!.toString()}
          refreshing={isRefetching}
          onRefresh={refetch}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollNotifications]}
          // style={styles.scrollNotifications}
        />
      </SwipeableListProvider>

      <Wrapper
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          paddingVertical: 5,
          backgroundColor: 'white',
          paddingHorizontal: 10,
        }}>
        <ClockinButtonLaborReport list={list!} />
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    flexGrow: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  scrollNotifications: {
    paddingTop: 10,
    paddingBottom: 70,
    paddingHorizontal: 15,
    gap: 10,
  },
  containerNotification: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  viewNotification: {
    backgroundColor: '#F7F5F4',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  circleNotification: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
  },
  letterNotification: {
    alignSelf: 'center',
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  viewDescNotification: {
    paddingLeft: 10,
    paddingRight: 40,
  },
  titleNotification: {
    color: '#464646',
    fontSize: 16,
  },
  subtitleNotification: {
    color: '#3C424A',
    opacity: 0.66,
    fontSize: 12,
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  rightActions: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6C6C',
  },
  rightActionsEdit: {
    width: 60,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#96DBDB',
  },
  btnOptTop: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    height: 27,
    width: 27,
    padding: 5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  topsheet: {
    color: '#3a3a3a',
  },
});
