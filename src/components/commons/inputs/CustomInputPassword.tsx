import {Icons} from '@assets/icons/icons';
import React, {forwardRef, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps,
} from 'react-native';
import {Label} from '../text/Label';
import {Wrapper} from '../wrappers/Wrapper';
import {PressableOpacity} from '../buttons/PressableOpacity';
import {COLORS} from '@styles/colors';

export type CustomInputPasswordProps = TextInputProps & {
  containerProps?: ViewProps;
  labelProps?: TextProps;
  label?: string;
  inputProps?: ViewProps;
};

export const CustomInputPassword = forwardRef(
  (
    {
      containerProps,
      inputProps,
      labelProps,
      label,
      autoCorrect = false,
      autoCapitalize = 'none',
      ...rest
    }: CustomInputPasswordProps,
    ref?: React.Ref<TextInput>,
  ) => {
    const [show, setShow] = useState(false);

    function toggle() {
      setShow(!show);
    }

    return (
      <View
        {...containerProps}
        style={[styles.container, containerProps?.style]}>
        {label && (
          <Label {...labelProps} style={[styles.title, labelProps?.style]}>
            {label}
          </Label>
        )}
        <Wrapper
          {...inputProps}
          style={[
            styles.containerInput,
            rest.editable ? {} : styles.disabled,
            inputProps?.style,
          ]}>
          <TextInput
            ref={ref}
            secureTextEntry={!show}
            autoCorrect={autoCorrect}
            autoCapitalize={autoCapitalize}
            {...rest}
            style={[
              rest.editable ? {} : styles.disabled,
              styles.input,
              rest.style,
            ]}
          />
          <PressableOpacity onPress={toggle}>
            {!show ? (
              <Icons.EyeSlash width={20} height={20} fontSize={10} />
            ) : (
              <Icons.Eye width={20} height={20} fontSize={10} />
            )}
          </PressableOpacity>
        </Wrapper>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  containerInput: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: COLORS.gray,
    color: COLORS.inputTextColor,
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    height: '100%',
    fontSize: 16,
    flex: 1,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
  },
  title: {
    color: COLORS.gray,
    fontSize: 13,
  },
});
