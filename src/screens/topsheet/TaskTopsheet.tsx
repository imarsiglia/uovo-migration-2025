import {PAUSED_STATUS, STARTED_STATUS} from '@api/contants/constants';
import {useGetTaskCount} from '@api/hooks/HooksJobServices';
import {SendBOLBottomSheet} from '@components/bottomSheets/SendBOLBottomSheet';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import CustomDropdown from '@components/commons/menu/CustomDropdown';
import CustomMenu from '@components/commons/menu/CustomMenu';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import TaskOption from '@components/topheet/TaskOption';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import useTopSheetStore from '@store/topsheet';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {ScrollView, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const TaskTopsheet = () => {
  const {navigate} = useCustomNavigation();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);

  const {data: taskCount} = useGetTaskCount({idJob: jobDetail?.id!});

  if (!jobDetail) {
    return <></>;
  }

  if (!taskCount) {
    return <></>;
  }

  return (
    <Wrapper style={[styles.containerTabScreen]}>
      <ScrollView style={{paddingTop: 15, paddingBottom: 15}}>
        <Wrapper
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 100,
          }}>
          <TaskOption
            name={taskCount[0].description}
            icon="file-invoice"
            color="#3ABD6C"
            quantity={taskCount[0].quantity}
            openDialog={true}
            // forwardRef={refBOL}
            onPressLeft={() =>
              jobDetail?.use_bol ? navigate('Signature') : null
            }
            onPressRight={() => (jobDetail?.use_bol ? showBOL() : null)}
            disabled={!jobDetail?.use_bol}
            // offline={[SIGNATURE_OFFLINE_VALIDATION, JOB_BOL_OFFLINE_VALIDATION]}
            idJob={jobDetail.id}
          />
          <TaskOption
            name={taskCount[1].description}
            icon="image"
            color="#7966E0"
            quantity={taskCount[1].quantity}
            onPressLeft={() => navigate('Images')}
            onPressRight={() => navigate('TakeImages', {fromList: false})}
            // offline={[IMAGES_OFFLINE_VALIDATION]}
            idJob={jobDetail?.id!}
          />
          <TaskOption
            name={taskCount[2].description}
            icon="sticky-note"
            color="#F2DA31"
            quantity={taskCount[2].quantity}
            onPressLeft={() => navigate('Notes')}
            onPressRight={() => navigate('TakeNotes', {fromList: false})}
            // offline={[NOTES_OFFLINE_VALIDATION]}
            idJob={jobDetail.id}
          />
          <TaskOption
            name={taskCount[3].description}
            icon="box-full"
            color="#E95818"
            quantity={taskCount[3].quantity}
            onPressLeft={() => navigate('ReportMaterials')}
            onPressRight={() => navigate('AddMaterials', {fromList: false})}
            // offline={[MATERIAL_OFFLINE_VALIDATION]}
            idJob={jobDetail.id}
          />

          <CustomDropdown
            buttonStyle={styles.buttonTask}
            button={
              <Wrapper style={GLOBAL_STYLES.row}>
                <Wrapper style={styles.viewIcon}>
                  <Icon
                    name="forklift"
                    type="solid"
                    color="white"
                    size={23}
                    style={styles.icon}
                  />
                </Wrapper>
                <Wrapper style={[styles.minPaddingLeft]}>
                  <Label
                    style={[GLOBAL_STYLES.bold, styles.labelTask]}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}>
                    Client's location
                  </Label>
                </Wrapper>
              </Wrapper>
            }>
            {({close}) => (
              <Wrapper
                style={[
                  styles.modalClientLocation,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}>
                <Label style={{fontSize: 16}}>Client's Location</Label>

                <Wrapper
                  style={[
                    GLOBAL_STYLES.row,
                    {justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 10},
                  ]}>
                  <Label
                    style={{fontWeight: 'bold', fontSize: 17, marginRight: 10}}>
                    Unit
                  </Label>
                  <Label style={{fontSize: 17, maxWidth: '80%'}}>
                    {jobDetail.client_location}
                  </Label>
                </Wrapper>

                <PressableOpacity
                  onPress={close}
                  style={{
                    right: 30,
                    padding: 5,
                    alignSelf: "flex-end"
                  }}>
                  <Label>Close</Label>
                </PressableOpacity>
              </Wrapper>
            )}
          </CustomDropdown>

          {/* <TaskNoAdd
            description={taskCount[4].description}
            quantity={taskCount[4].quantity}
            onPress={() => navigate('Reports')}
            idJob={jobDetail.id}
            offline={[
              CONDITION_REPORT_OFFLINE_VALIDATION,
              CONDITION_CHECK_OFFLINE_VALIDATION,
            ]}
          /> */}

          {/* {!loadingService && ( */}
          {true && (
            <PressableOpacity
              style={[styles.buttonTask]}
              onPress={() =>
                goToLaborReport(
                  jobDetail.current_clock_in != null &&
                    (jobDetail.current_clock_in?.status == STARTED_STATUS ||
                      jobDetail.current_clock_in?.status == PAUSED_STATUS)
                    ? 0
                    : 1,
                )
              }>
              <Wrapper style={GLOBAL_STYLES.row}>
                <Wrapper
                  style={[styles.viewIcon, {backgroundColor: '#4cabf7'}]}>
                  <Icon
                    name="user-clock"
                    type="solid"
                    color="white"
                    size={23}
                    style={styles.icon}
                  />
                </Wrapper>
                <Wrapper style={styles.minPaddingLeft}>
                  <Label style={[GLOBAL_STYLES.bold, styles.labelTask]}>
                    Labor report
                  </Label>
                </Wrapper>
              </Wrapper>
            </PressableOpacity>
          )}
        </Wrapper>
      </ScrollView>

      {/* <SendBOLBottomSheet /> */}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  containerTabScreen: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fbfbfb',
  },
  buttonTask: {
    flexDirection: 'row',
    backgroundColor: '#F7F5F4',
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    alignContent: 'center',
    marginBottom: 15,
    paddingLeft: 20,
    paddingRight: 0,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  minPaddingLeft: {
    paddingLeft: 10,
  },
  viewIcon: {
    backgroundColor: '#A278C2',
    width: 45,
    height: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    alignSelf: 'center',
  },
  labelTask: {
    color: '#464646',
    fontSize: 14,
  },
  modalClientLocation: {
    paddingTop: 10,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
  },
});
