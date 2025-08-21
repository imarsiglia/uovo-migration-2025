
import { COLORS } from '@styles/colors';
import React from 'react';
import {
  PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle
} from 'react-native';
import { Label } from '../text/Label';
import { Wrapper } from '../wrappers/Wrapper';
import { PressableOpacity } from './PressableOpacity';

export type RoundedButtonProps = {
  label: string;
  icon?: React.ReactNode;
  labelStyles?: StyleProp<TextStyle>;
  buttonStyles?: StyleProp<ViewStyle>;
} & PressableProps;

export const RoundedButton = ({
  label,
  icon,
  buttonStyles,
  labelStyles,
  ...rest
}: RoundedButtonProps) => {

  return (
    <PressableOpacity
      {...rest}
      style={[
        {
          backgroundColor: COLORS.primary,
        },
        styles.button,
        rest.style as StyleProp<ViewStyle>
      ]}>
      {icon && <Wrapper style={styles.containerIcon}>{icon}</Wrapper>}
      <Label style={[{color: COLORS.white}, styles.label, labelStyles]}>
        {label}
      </Label>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    minHeight: 48,
    display: 'flex',
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 4
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  containerIcon: {
    backgroundColor: 'transparent',
  },
});
