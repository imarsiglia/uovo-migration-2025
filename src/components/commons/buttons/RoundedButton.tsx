import {COLORS} from '@styles/colors';
import {forwardRef} from 'react';
import {
  ActivityIndicator,
  PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {Label} from '../text/Label';
import {Wrapper} from '../wrappers/Wrapper';
import {PressableOpacity} from './PressableOpacity';
import {IndicatorLoading} from '../loading/IndicatorLoading';

export type RoundedButtonProps = {
  label: string;
  icon?: React.ReactNode;
  labelStyles?: StyleProp<TextStyle>;
  buttonStyles?: StyleProp<ViewStyle>;
  loading?: boolean;
} & PressableProps;

export const RoundedButton = forwardRef(
  (
    {
      label,
      icon,
      buttonStyles,
      labelStyles,
      loading,
      ...rest
    }: RoundedButtonProps,
    ref: React.Ref<View>,
  ) => {
    return (
      <PressableOpacity
        ref={ref}
        {...rest}
        style={[
          {
            backgroundColor: COLORS.primary,
          },
          styles.button,
          rest.style as StyleProp<ViewStyle>,
        ]}>
        {loading ? (
          <IndicatorLoading
            activityIndicatorProps={{
              size: 'small',
              color: COLORS.primary,
              style: {
                alignSelf: 'center',
              },
            }}
          />
        ) : (
          <>
            {icon && <Wrapper style={styles.containerIcon}>{icon}</Wrapper>}
            <Label style={[{color: COLORS.white}, styles.label, labelStyles]}>
              {label}
            </Label>
          </>
        )}
      </PressableOpacity>
    );
  },
);

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
