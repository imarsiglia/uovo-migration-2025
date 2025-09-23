import {
  PAUSED_STATUS,
  QUERY_KEYS,
  STARTED_STATUS,
} from '@api/contants/constants';
import {
  useGetEmployees,
  useGetLaborCodes,
  useGetLaborReports,
  useRegisterLaborReport,
} from '@api/hooks/HooksTaskServices';
import { BackButton } from '@components/commons/buttons/BackButton';
import { AutocompleteContext } from '@components/commons/form/AutocompleteContext';
import { BasicFormProvider } from '@components/commons/form/BasicFormProvider';
import { BottomSheetSelectInputContext } from '@components/commons/form/BottomSheetSelectInputContext';
import { ButtonSubmit } from '@components/commons/form/ButtonSubmit';
import { InputTextContext } from '@components/commons/form/InputTextContext';
import { GeneralLoading } from '@components/commons/loading/GeneralLoading';
import { Label } from '@components/commons/text/Label';
import MinRoundedView from '@components/commons/view/MinRoundedView';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import {
  AddLaborSchema,
  AddLaborSchemaType
} from '@generalTypes/schemas';
import { useCustomNavigation } from '@hooks/useCustomNavigation';
import { useRefreshIndicator } from '@hooks/useRefreshIndicator';
import { RootStackParamList } from '@navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadingWrapperPromise } from '@store/actions';
import { useModalDialogStore } from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import { COLORS } from '@styles/colors';
import { GLOBAL_STYLES } from '@styles/globalStyles';
import { formatWorkedHours } from '@utils/functions';
import { showErrorToastMessage, showToastMessage } from '@utils/toast';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = NativeStackScreenProps<RootStackParamList, 'AddLaborReport'>;
export const AddLaborReportScreen = (props: Props) => {
  const itemToEdit = props.route.params?.item;

  const itemRef = useRef<any>(null);

  const {goBack} = useCustomNavigation();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const toClockout = useTopSheetStore((d) => d.toClockout);
  const isJobQueue = useTopSheetStore((d) => d.isJobQueue);
  const [filter, setFilter] = useState('');
  const showDialog = useModalDialogStore((d) => d.showVisible);

  const {mutateAsync: registerLaborReport} = useRegisterLaborReport();
  const {data: employees} = useGetEmployees({
    filter,
  });

  const {data: laborReports, isLoading} = useGetLaborReports({
    idJob: jobDetail.id,
    toClockout,
    enabled: false,
  });

  const {data: laborCodes} = useGetLaborCodes();

  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TASK_COUNT, {idJob: jobDetail.id}],
    [QUERY_KEYS.LABOR_REPORTS, {idJob: jobDetail.id, toClockout}],
  ]);

  const preventEditCurrentClock = useMemo(() => {
    return (
      jobDetail?.current_clock_in?.status == STARTED_STATUS ||
      jobDetail?.current_clock_in?.status == PAUSED_STATUS
    );
  }, [jobDetail?.current_clock_in]);

  const confirmSaveLaborReport = useCallback(
    (props: AddLaborSchemaType) => {
      const mLaborCode = laborCodes?.find(
        (x) => x.id.toString() === props.code,
      );
      if (mLaborCode) {
        if (itemToEdit) {
          return registerLaborReport({
            idJob: jobDetail!.id,
            confirm: 0,
            preventEditCurrentClock,
            queue: isJobQueue!,
            list: [
              ...laborReports
                ?.filter((x) => x.id != itemToEdit.id)
                ?.map((x) => ({
                  laborCode: x.labor_code?.id,
                  addedManually: x.added_manually,
                  workedHours: x.worked_hour,
                  userName: x.user_name,
                  ...x,
                })),
              {
                ...itemToEdit,
                //@ts-ignore
                laborCode: mLaborCode.id?.toString(),
                addedManually: itemToEdit.added_manually?.toString(),
                workedHours: formatWorkedHours(props.hours, props.minutes),
                userName: props.handler?.title,
                labor_code: mLaborCode,
                worked_hour: formatWorkedHours(props.hours, props.minutes),
                user_name: props.handler?.title,
                id_user: Number(props.handler.id),
              },
            ],
          });
        } else {
          return registerLaborReport({
            idJob: jobDetail!.id,
            confirm: 0,
            preventEditCurrentClock,
            queue: isJobQueue,
            list: [
              ...laborReports?.map((x) => ({
                laborCode: x.labor_code?.id,
                addedManually: x.added_manually,
                workedHours: x.worked_hour,
                userName: x.user_name,
                ...x,
              })),
              {
                id: null,
                //@ts-ignore
                laborCode: mLaborCode.id?.toString(),
                addedManually: 1,
                workedHours: formatWorkedHours(props.hours, props.minutes),
                userName: props.handler?.title,
                id_job: jobDetail.id,
                id_user: Number(props.handler.id),
                user_name: props.handler?.title,
                worked_hour: formatWorkedHours(props.hours, props.minutes),
                added_manually: 1,
                labor_code: mLaborCode,
              },
            ],
          });
        }
      } else {
        return Promise.resolve(false);
      }
    },
    [
      laborReports,
      jobDetail,
      registerLaborReport,
      itemToEdit,
      preventEditCurrentClock,
    ],
  );

  const saveLaborReport = useCallback(
    (props: AddLaborSchemaType) => {
      showDialog({
        modalVisible: true,
        cancelable: true,
        message: 'Sure do You want to add this labor report?',
        type: 'info',
        onConfirm: () => {
          showDialog({
            modalVisible: false,
          });
          loadingWrapperPromise(
            confirmSaveLaborReport(props)
              .then((d) => {
                if (d) {
                  showToastMessage('Labor code saved successfully');
                  goBack();
                  setTimeout(() => {
                    refetchAll();
                  }, 300);
                } else {
                  showErrorToastMessage(
                    'Error while saving labor report, try again',
                  );
                }
              })
              .catch((e) => {
                console.log('error', e);
                showErrorToastMessage(
                  'Error while saving labor report, try again',
                );
              }),
          );
        },
      });
    },
    [
      laborReports,
      showDialog,
      confirmSaveLaborReport,
      refetchAll,
      //   refetch,
      goBack,
    ],
  );

  const closeAutocomplete = useCallback(() => {
    if (itemRef.current) {
      itemRef.current.close();
    }
  }, []);

  const checkItem = useCallback(
    (value: string) => {
      setFilter(value.trim());
    },
    [setFilter],
  );

  if (isLoading || !laborCodes) {
    return <GeneralLoading />;
  }

  return (
    <View style={[styles.container]}>
      <View style={GLOBAL_STYLES.bgwhite}>
        <View style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton onPress={goBack} />
        </View>

        <View style={[styles.lateralPadding, styles.row]}>
          <Text
            style={[GLOBAL_STYLES.title, GLOBAL_STYLES.bold, styles.topsheet]}>
            Add labor
          </Text>
        </View>
      </View>

      <MinRoundedView />
      <View
        style={{
          paddingTop: 20,
          paddingHorizontal: 20,
        }}>
        <BasicFormProvider
          schema={AddLaborSchema}
          defaultValue={{
            code: itemToEdit?.labor_code?.id?.toString(),
            hours: itemToEdit?.worked_hour?.split(':')[0],
            minutes: itemToEdit?.worked_hour?.split(':')[1],
            handler: {
              id: itemToEdit?.id_user?.toString(),
              title: itemToEdit?.user_name,
            },
          }}>
          <View style={{paddingBottom: 0, height: 45}}>
            <View style={styles.autocompleteContainer}>
              <AutocompleteContext
                name="handler"
                dataSet={employees?.map((x) => ({
                  id: x.id.toString(),
                  title: x.name,
                }))!}
                textInputProps={{
                  placeholder: 'Search a handler',
                }}
                controllerRef={(controller) => {
                  itemRef.current = controller;
                }}
                onChangeText={checkItem}
                initialValue={
                  itemToEdit?.id_user
                    ? {
                        id: itemToEdit.id_user.toString(),
                        title: itemToEdit.user_name,
                      }
                    : undefined
                }
                onFocus={() => {
                  closeAutocomplete();
                  itemRef.current.open();
                }}
              />
            </View>
          </View>

          <View style={{marginTop: 10}}>
            <View style={[GLOBAL_STYLES.row, styles.containerFields]}>
              <Label>Labor:</Label>
              <Wrapper style={[GLOBAL_STYLES.row, {minWidth: '60%'}]}>
                <InputTextContext
                  currentId="hours"
                  placeholder="hours"
                  containerProps={{
                    style: {
                      flex: 1,
                    },
                  }}
                />
                <Label style={{marginHorizontal: 5}}>:</Label>
                <InputTextContext
                  currentId="minutes"
                  placeholder="minutes"
                  containerProps={{
                    style: {
                      flex: 1,
                    },
                  }}
                />
              </Wrapper>
            </View>
            <View style={[GLOBAL_STYLES.row, styles.containerFields]}>
              <Text>Code:</Text>
              <BottomSheetSelectInputContext
                currentId="code"
                options={laborCodes}
                placeholder="Select a labor code"
                snapPoints={['95%']}
                label="Search"
                labelKey="description"
                containerStyle={{minWidth: '60%', borderRadius: 10}}
              />
            </View>

            <View style={{marginTop: 40, marginBottom: 20}}>
              <ButtonSubmit
                label="Save"
                icon={<Icon name="save" type="solid" size={16} color="white" />}
                onSubmit={saveLaborReport}
                showValidationError
              />
            </View>
          </View>
        </BasicFormProvider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fbfbfb',
  },
  lateralPadding: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#959595',
    fontSize: 18,
    paddingBottom: 1,
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
  title: {
    color: '#3C424A',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#959595',
    marginBottom: 5,
    marginTop: 10,
    paddingLeft: 5,
    fontSize: 13,
  },
  containerFields: {
    justifyContent: 'space-between',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5F4',
  },
  inputDimensions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    width: 100,
    height: 43,
    textAlign: 'center',
    color: '#3C424A',
    paddingTop: 10,
  },
  btnSaveInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.primary,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  textSaveInfo: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  inputSearch: {
    borderColor: '#d0d0d0',
    borderRadius: 10,
    borderWidth: 0.3,
    backgroundColor: 'white',
    padding: 10,
    paddingBottom: 0,
    paddingTop: 0,
    height: 40,
    justifyContent: 'center',
  },
});
