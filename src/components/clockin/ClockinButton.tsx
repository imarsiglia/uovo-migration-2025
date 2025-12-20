import {
  FINALIZED_STATUS,
  PAUSED_STATUS,
  QUERY_KEYS,
  STARTED_STATUS,
} from '@api/contants/constants';
import {
  useClockIn,
  useClockout,
  useGetTopsheet,
  usePauseJob,
  useResumeJob,
} from '@api/hooks/HooksJobServices';
import {useGetLaborCodes} from '@api/hooks/HooksTaskServices';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
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
import {showErrorToastMessage} from '@utils/toast';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const ClockinButton = () => {
  const [fetched, setFetched] = useState(false);
  const {navigate} = useCustomNavigation();
  const selectedDate = useGeneralStore((d) => d.selectedDate);
  const {jobDetail, isJobQueue, setToClockout} = useTopSheetStore();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {data: laborCodes, isLoading} = useGetLaborCodes();
  const {mutateAsync: clockInAsync} = useClockIn();
  const {mutateAsync: pauseJobAsync} = usePauseJob();
  const {mutateAsync: clockoutAsync} = useClockout();
  const {mutateAsync: resumeJobAsync} = useResumeJob();

  const {refetch: refetchJobDetail, isRefetching: isRefetchingTopsheet} =
    useGetTopsheet({
      id: jobDetail?.id?.toString()!,
      queue: isJobQueue!,
      enabled: false
    });

  const {refetchAll, isRefetchingAny} = useRefreshIndicator([
    [QUERY_KEYS.TOPSHEET, {id: jobDetail?.id?.toString(), queue: isJobQueue}],
    [QUERY_KEYS.TIMELINE, selectedDate],
  ]);

  const goToLaborReport = useCallback(() => {
    if (setToClockout) {
      setToClockout(1);
      navigate(RoutesNavigation.LaborReport);
    }
  }, [navigate, setToClockout]);

  const refetchTopsheet = useCallback(() => {
    loadingWrapperPromise(
      refetchAll()
        .then(() => {
          refetchJobDetail()
            .then((d) => {
              if (d?.data?.current_clock_in?.status === FINALIZED_STATUS) {
                goToLaborReport();
              }
            })
            .catch(() => {});
        })
        .catch(() => {}),
    );
  }, [refetchAll, refetchJobDetail, goToLaborReport]);

  const clockIn = useCallback(
    (props: ClockInSchemaType) => {
      loadingWrapperPromise(
        clockInAsync({
          idJob: jobDetail!.id,
          laborCode: props.code,
          queue: isJobQueue!,
        })
          .then((d) => {
            if (d) {
              refetchTopsheet();
            } else {
              showErrorToastMessage('An error has ocurred');
            }
          })
          .catch(() => {
            showErrorToastMessage('An error has ocurred');
          }),
      );
    },
    [jobDetail?.id, isJobQueue, refetchTopsheet, clockInAsync],
  );

  const pauseJob = useCallback(() => {
    loadingWrapperPromise(
      pauseJobAsync({
        idJob: jobDetail!.id,
        queue: isJobQueue!,
      })
        .then((d) => {
          if (d) {
            refetchTopsheet();
          } else {
            showErrorToastMessage('An error has ocurred');
          }
        })
        .catch(() => {
          showErrorToastMessage('An error has ocurred');
        }),
    );
  }, [jobDetail?.id, isJobQueue, refetchTopsheet, pauseJobAsync]);

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
            Order #: {jobDetail!.netsuite_order}
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
            idJob: jobDetail!.id,
            queue: isJobQueue!,
          })
            .then((d) => {
              if (d) {
                refetchTopsheet();
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
  }, [showDialog, jobDetail, isJobQueue, refetchTopsheet, clockoutAsync]);

  const resumeJob = useCallback(() => {
    loadingWrapperPromise(
      resumeJobAsync({
        idJob: jobDetail!.id,
        queue: isJobQueue!,
      })
        .then((d) => {
          if (d) {
            refetchTopsheet();
          } else {
            showErrorToastMessage('An error has ocurred');
          }
        })
        .catch(() => {
          showErrorToastMessage('An error has ocurred');
        }),
    );
  }, [resumeJobAsync, jobDetail?.id, isJobQueue, refetchTopsheet]);

  const canClockin = useMemo(() => {
    if (jobDetail) {
      return (
        !jobDetail.current_clock_in ||
        (jobDetail.current_clock_in &&
          jobDetail.current_clock_in?.status == FINALIZED_STATUS)
      );
    } else {
      return false;
    }
  }, [jobDetail?.current_clock_in]);

  const isActive = useMemo(() => {
    return (
      jobDetail?.current_clock_in?.status == STARTED_STATUS ||
      jobDetail?.current_clock_in?.status == PAUSED_STATUS
    );
  }, [jobDetail?.current_clock_in]);

  const isStarted = useMemo(() => {
    return jobDetail?.current_clock_in?.status == STARTED_STATUS;
  }, [jobDetail?.current_clock_in]);

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      {canClockin && (
        <CustomDropdown
          button={
            <Wrapper style={styles.button}>
              <Icon name="play" color="white" size={14} />
              <Label style={styles.label}>Clock in</Label>
            </Wrapper>
          }>
          {({close}) => (
            <BasicFormProvider schema={ClockInSchema}>
              <Wrapper style={[styles.modalClockin]}>
                <Wrapper
                  style={[
                    GLOBAL_STYLES.row,
                    styles.containerHeaderModalClockin,
                  ]}>
                  <Wrapper style={{width: 54}}></Wrapper>
                  <Label style={styles.titleLaborCode}>Labor report</Label>
                  <Wrapper style={[GLOBAL_STYLES.row, {gap: 10}]}>
                    <PressableOpacity
                      style={GLOBAL_STYLES.btnOptTop}
                      onPress={() => {
                        goToLaborReport();
                        close();
                      }}>
                      <Icon name="eye" color="white" type="solid" size={15} />
                    </PressableOpacity>

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
                      options={laborCodes!}
                      placeholderInput="Select a labor code"
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
        <Wrapper style={{flexDirection: 'row', gap: 5}}>
          {isStarted ? (
            <RoundedButton
              onPress={pauseJob}
              label="Pause job"
              icon={<Icon name="pause" color="white" size={14} />}
              style={styles.activeButton}
              disabled={isRefetchingTopsheet}
            />
          ) : (
            <RoundedButton
              onPress={resumeJob}
              label="Resume job"
              icon={<Icon name="step-forward" color="white" size={14} />}
              style={styles.activeButton}
              disabled={isRefetchingTopsheet}
            />
          )}

          <RoundedButton
            onPress={clockout}
            label="Clock out"
            icon={<Icon name="stop" color={COLORS.primary} size={14} />}
            style={[
              styles.activeButton,
              {
                backgroundColor: COLORS.white,
                borderColor: COLORS.primary,
                borderWidth: 1,
              },
            ]}
            labelStyles={{color: COLORS.primary}}
            disabled={isRefetchingTopsheet}
          />
        </Wrapper>
      )}

      {(isRefetchingAny || isRefetchingTopsheet) && (
        <Wrapper
          style={{
            position: 'absolute',
            width: '120%',
            backgroundColor: 'transparent',
            minHeight: 60,
            zIndex: 1,
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
    flex: 0.5,
  },
});
