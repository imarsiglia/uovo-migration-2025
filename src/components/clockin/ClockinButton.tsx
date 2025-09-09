import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {RoundedButton} from '@components/commons/buttons/RoundedButton';
import {BasicFormProvider} from '@components/commons/form/BasicFormProvider';
import {BottomSheetSelectInputContext} from '@components/commons/form/BottomSheetSelectInputContext';
import CustomDropdown from '@components/commons/menu/CustomDropdown';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const ClockinButton = () => {
  return (
    <CustomDropdown
      button={
        <Wrapper style={styles.button}>
          <Icon name="play" color="white" size={14} />
          <Label style={styles.label}>Clock in</Label>
        </Wrapper>
      }>
      <BasicFormProvider>
        <Wrapper style={[styles.modalClockin]}>
          <Wrapper
            style={[
              GLOBAL_STYLES.row,
              GLOBAL_STYLES.lateralPadding,
              styles.containerHeaderModalClockin,
            ]}>
            <Wrapper style={{width: 54}}></Wrapper>
            <Label style={styles.titleLaborCode}>Labor report</Label>
            <Wrapper style={GLOBAL_STYLES.row}>
              <PressableOpacity
                style={GLOBAL_STYLES.btnOptTop}
                onPress={() => goToLaborReport(1)}>
                <Icon name="eye" color="white" type="solid" size={15} />
              </PressableOpacity>

              <PressableOpacity
                style={GLOBAL_STYLES.btnOptTop}
                onPress={() => clockIn()}>
                <Icon name="save" color="white" type="solid" size={15} />
              </PressableOpacity>
            </Wrapper>
          </Wrapper>

          <Wrapper style={styles.borderBottom}></Wrapper>

          <Wrapper
            style={[
              GLOBAL_STYLES.row,
              GLOBAL_STYLES.lateralPadding,
              styles.containerBodyModalClockin,
            ]}>
            <Label style={[GLOBAL_STYLES.bold]}>Labor code</Label>
            <Wrapper style={[GLOBAL_STYLES.fiftyFive]}>
              <BottomSheetSelectInputContext
                currentId="code"
                options={[]}
                placeholder="Select a labor code"
                label="Search"
              />
              {/* <RNPickerSelect
                  items={laborCodes}
                  onValueChange={(value) => setLaborCode(value)}
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 10,
                      right: 5,
                    },
                  }}
                  value={laborCode}
                  placeholder={{
                    label: 'Select a labor code',
                    value: null,
                  }}
                  fixAndroidTouchableBug={Platform.OS == 'android'}
                  useNativeAndroidPickerStyle={false}
                  textInputProps={{}}
                  Icon={() => {
                    return (
                      <Icon
                        name="angle-down"
                        size={16}
                        color="#959595"
                        style={{}}
                      />
                    );
                  }}
                /> */}
            </Wrapper>
          </Wrapper>
        </Wrapper>
      </BasicFormProvider>
    </CustomDropdown>
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
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomWidth: 0,
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
});
