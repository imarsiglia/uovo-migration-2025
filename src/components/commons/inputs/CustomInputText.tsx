import {Label} from '@components/commons/text/Label';
import {COLORS} from '@styles/colors';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps,
} from 'react-native';

export type CustomInputTextProps = TextInputProps & {
  containerProps?: ViewProps;
  labelProps?: TextProps;
  label?: string;
};

export const CustomInputText = ({
  containerProps,
  labelProps,
  label,
  autoCorrect = false,
  autoCapitalize = 'none',
  ...rest
}: CustomInputTextProps) => {
  return (
    <View {...containerProps} style={[styles.container, containerProps?.style]}>
      {label && (
        <Label {...labelProps} style={[styles.title, labelProps?.style]}>
          {label}
        </Label>
      )}
      <TextInput
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={COLORS.placeholderInput}
        {...rest}
        style={[
          rest.editable == false ? styles.disabled : {},
          styles.input,
          rest.style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  input: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: COLORS.borderInputColor,
    color: COLORS.inputTextColor,
    height: 40
  },
  disabled: {
    backgroundColor: COLORS.disabled,
  },
  title: {
    color: COLORS.gray,
    fontSize: 13,
  },
});
