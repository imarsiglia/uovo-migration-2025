import {
  CustomInputPassword,
  CustomInputPasswordProps,
} from '@components/commons/inputs/CustomInputPassword';
import {getInputIdFormContext} from '@utils/functions';
import {Controller, useFormContext} from 'react-hook-form';
import {TextInput, View} from 'react-native';
import {CustomInputTextProps} from '../inputs/CustomInputText';
import {InputErrorMsg} from './InputErrorMsg';
import {forwardRef} from 'react';

type Props = CustomInputPasswordProps & {
  currentId: string;
};

export const InputPasswordContext= forwardRef(
  ({currentId, ...restProps}: Props, ref?: React.Ref<TextInput>) => {
    const {
      control,
      formState: {errors},
    } = useFormContext();

    return (
      <View>
        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <CustomInputPassword
              ref={ref}
              {...restProps}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[
                restProps.style,
                errors[currentId] ? {borderColor: 'red'} : {},
              ]}
            />
          )}
          name={currentId}
        />

        {/* <InputErrorMsg
          message={getInputIdFormContext(errors, currentId)?.message}
        /> */}
      </View>
    );
  },
);
