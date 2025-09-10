import {
  FINALIZED_STATUS,
  PAUSED_STATUS,
  QUERY_KEYS,
  STARTED_STATUS,
} from '@api/contants/constants';
import {
  useClockIn,
  useClockout,
  usePauseJob,
} from '@api/hooks/HooksJobServices';
import {
  useGetLaborCodes,
  useRegisterLaborReport,
} from '@api/hooks/HooksTaskServices';
import {LaborReportType} from '@api/types/Task';
import {RoundedButton} from '@components/commons/buttons/RoundedButton';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
import {ButtonSubmit} from '@components/commons/form/ButtonSubmit';
import CustomDropdown from '@components/commons/menu/CustomDropdown';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {ClockInSchema, ClockInSchemaType} from '@generalTypes/schemas';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import useGeneralStore from '@store/general';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  list: LaborReportType[];
};
export const ClockinButtonLaborReport = ({list}: Props) => {
  const selectedDate = useGeneralStore((d) => d.selectedDate);
  const {toClockout, jobDetail, isJobQueue} = useTopSheetStore();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {data: laborCodes, isLoading} = useGetLaborCodes();
  const {mutateAsync: clockInAsync} = useClockIn();
  const {mutateAsync: clockoutAsync} = useClockout();
  const {mutateAsync: registerLaborReportAsync} = useRegisterLaborReport();

  const {goBackToIndex, goBack} = useCustomNavigation();

  const {refetchAll, isRefetchingAny} = useRefreshIndicator([
    [QUERY_KEYS.TOPSHEET, {id: jobDetail?.id?.toString(), queue: isJobQueue}],
    [QUERY_KEYS.LABOR_REPORTS, {idJob: jobDetail.id, toClockout}],
    [QUERY_KEYS.TIMELINE, selectedDate],
  ]);

  const clockIn = useCallback(
    (props: ClockInSchemaType) => {
      loadingWrapperPromise(
        clockInAsync({
          idJob: jobDetail.id,
          laborCode: props.code,
          queue: isJobQueue,
        })
          .then((d) => {
            if (d) {
              refetchAll();
              showToastMessage('Job started');
              goBack();
            } else {
              showErrorToastMessage('An error has ocurred');
            }
          })
          .catch(() => {
            showErrorToastMessage('An error has ocurred');
          }),
      );
    },
    [jobDetail, isJobQueue, refetchAll],
  );

  const clockout = useCallback(() => {
    showDialog({
      modalVisible: true,
      type: 'info',
      cancelable: true,
      message: (
        <Wrapper
          style={[GLOBAL_STYLES.bodyModalClockOut, {paddingHorizontal: 0}]}>
          <Label style={GLOBAL_STYLES.titleModalClockOut}>FINISH JOB?</Label>
          <Label style={GLOBAL_STYLES.subtitleModalClockOut}>
            Order #: {jobDetail.netsuite_order}
          </Label>
          <Label style={GLOBAL_STYLES.descModalClockOut}>
            Are you sure you want to finish the current job?
          </Label>
          <Label style={GLOBAL_STYLES.descModalClockOut}>
            Once finished you will not be able to make changes.
          </Label>
        </Wrapper>
      ),
      onConfirm: () => {
        showDialog({
          modalVisible: false,
        });
        loadingWrapperPromise(
          clockoutAsync({
            idJob: jobDetail.id,
            queue: isJobQueue,
          })
            .then((d) => {
              if (d) {
                refetchAll();
                showToastMessage('Job finished successfully');
              } else {
                showErrorToastMessage('An error has ocurred');
              }
            })
            .catch(() => {
              showErrorToastMessage('An error has ocurred');
            }),
        );
      },
    });
  }, [showDialog, jobDetail, isJobQueue, clockoutAsync, refetchAll]);

  const isActive = useMemo(() => {
    return (
      jobDetail?.current_clock_in?.status == STARTED_STATUS ||
      jobDetail?.current_clock_in?.status == PAUSED_STATUS
    );
  }, [jobDetail?.current_clock_in]);

  const isFinalized = useMemo(() => {
    return jobDetail?.current_clock_in?.status == FINALIZED_STATUS;
  }, [jobDetail?.current_clock_in]);

  const isUndefined = useMemo(() => {
    return !jobDetail?.current_clock_in?.status;
  }, [jobDetail?.current_clock_in]);

  const confirmJob = useCallback(() => {
    loadingWrapperPromise(
      registerLaborReportAsync({
        idJob: jobDetail.id,
        queue: isJobQueue,
        preventEditCurrentClock: false,
        confirm: 1,
        list: list?.map((x) => ({
          ...x,
          laborCode: x.labor_code,
          addedManually: x.added_manually,
          workedHours: x.worked_hour,
          userName: x.user_name,
        })),
      })
        .then((d) => {
          if (d) {
            refetchAll();
            // removeAndRefresh();
            showToastMessage('Job confirmed successfully');
            goBackToIndex(2);
          } else {
            showErrorToastMessage('An error occurred while confirming');
          }
        })
        .catch(() =>
          showErrorToastMessage('An error occurred while confirming'),
        ),
    );
  }, [
    registerLaborReportAsync,
    list,
    jobDetail?.id,
    isJobQueue,
    refetchAll,
    // removeAndRefresh,
    goBackToIndex,
  ]);

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      {isUndefined && (
        <CustomDropdown
          button={
            <Wrapper style={styles.button}>
              <Icon name="play" color="white" size={14} />
              <Label style={styles.label}>Clock in</Label>
            </Wrapper>
          }>
          {({close}) => (
            <BasicFormProvider
              schema={ClockInSchema}
              defaultValue={{
                code: laborCodes?.map((x) => x.id)[0]?.toString(),
              }}>
              <Wrapper style={[styles.modalClockin]}>
                <Wrapper
                  style={[
                    GLOBAL_STYLES.row,
                    styles.containerHeaderModalClockin,
                  ]}>
                  <Wrapper style={{width: 54}}></Wrapper>
                  <Label style={styles.titleLaborCode}>Labor report</Label>
                  <Wrapper style={[GLOBAL_STYLES.row, {gap: 10}]}>
                    <ButtonSubmit
                      onSubmit={(data) => {
                        clockIn(data);
                        close();
                      }}
                      onInvalid={() =>
                        showErrorToastMessage(
                          'Please, select a valid labor code',
                        )
                      }
                      style={[
                        GLOBAL_STYLES.btnOptTop,
                        {minHeight: 0, paddingHorizontal: 0},
                      ]}
                      icon={
                        <Icon
                          name="save"
                          color="white"
                          type="solid"
                          size={15}
                        />
                      }
                    />
                  </Wrapper>
                </Wrapper>

                <Wrapper style={styles.borderBottom}></Wrapper>

                <Wrapper
                  style={[GLOBAL_STYLES.row, styles.containerBodyModalClockin]}>
                  <Label style={[GLOBAL_STYLES.bold]}>Labor code</Label>
                  <Wrapper style={{flex: 0.7}}>
                    <BottomSheetSelectInputContext
                      currentId="code"
                      options={laborCodes}
                      placeholder="Select a labor code"
                      label="Search"
                      labelKey="description"
                      snapPoints={['95%']}
                    />
                  </Wrapper>
                </Wrapper>
              </Wrapper>
            </BasicFormProvider>
          )}
        </CustomDropdown>
      )}

      {isActive && (
        <Wrapper style={styles.containerButton}>
          <RoundedButton
            onPress={clockout}
            label="Clock out"
            icon={<Icon name="stop" color={COLORS.white} size={14} />}
            style={styles.activeButton}
          />
        </Wrapper>
      )}

      {isFinalized && (
        <Wrapper style={styles.containerButton}>
          <RoundedButton
            onPress={confirmJob}
            label="Confirm"
            icon={<Icon name="check-circle" color={COLORS.white} size={14} />}
            style={styles.activeButton}
          />
        </Wrapper>
      )}

      {isRefetchingAny && (
        <Wrapper
          style={{
            position: 'absolute',
            width: '120%',
            backgroundColor: 'transparent',
            minHeight: 60,
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    minHeight: 48,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 5,
    backgroundColor: COLORS.primary,
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  containerIcon: {
    backgroundColor: 'transparent',
  },
  modalClockin: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingTop: 10,
    paddingBottom: 40,
    borderBottomWidth: 0,
    minWidth: '95%',
    paddingHorizontal: 10,
  },
  containerHeaderModalClockin: {
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  titleLaborCode: {
    alignSelf: 'center',
    color: '#BCBCBC',
    fontSize: 15,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F7F5F4',
  },
  containerBodyModalClockin: {
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  activeButton: {
    flex: 1,
  },
  containerButton: {
    flexDirection: 'row',
    gap: 5,
  },
});
