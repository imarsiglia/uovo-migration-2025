import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {CustomPressable} from '../pressable/CustomPressable';
import {Label} from '../text/Label';
import {Wrapper} from '../wrappers/Wrapper';
import {COLORS} from '@styles/colors';

type Props = {
  checked?: boolean;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
};
export const InputCheck = ({
  checked,
  onPress,
  containerStyle,
  disabled = false,
}: Props) => {
  return (
    <CustomPressable onPress={onPress} disabled={disabled}>
      <Wrapper
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          containerStyle,
        ]}>
        {checked ? <Label style={styles.checkboxIcon}>✓</Label> : null}
      </Wrapper>
    </CustomPressable>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: COLORS.tertearyDark,
    borderColor: COLORS.tertearyDark,
  },
  checkboxIcon: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
});
