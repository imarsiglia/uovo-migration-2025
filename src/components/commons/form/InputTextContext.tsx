import { getInputIdFormContext } from '@utils/functions';
import { Controller, useFormContext } from 'react-hook-form';
import { View } from 'react-native';
import { CustomInputText, CustomInputTextProps } from '../inputs/CustomInputText';
import { InputErrorMsg } from './InputErrorMsg';
import { COLORS } from '@styles/colors';

type Props = CustomInputTextProps & {
  currentId: string;
  isErrorHidden?: boolean;
};

export const InputTextContext = ({currentId, isErrorHidden, ...restProps}: Props) => {
  const {
    control,
    formState: {errors},
  } = useFormContext();

  return (
    <View>
      <Controller
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <CustomInputText
            {...restProps}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={[
              restProps.style,
              errors[currentId] ? {borderColor: COLORS.error} : {},
            ]}
          />
        )}
        name={currentId}
      />

      {/* <InputErrorMsg
        message={getInputIdFormContext(errors, currentId)?.message}
        isHidden={isErrorHidden}
      /> */}
    </View>
  );
};
