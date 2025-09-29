import {Controller, useFormContext} from 'react-hook-form';
import {getInputIdFormContext} from '@utils/functions';
import {InputErrorMsg} from './InputErrorMsg';
import {COLORS} from '@styles/colors';
import {DatePickerCalendar} from '@components/commons/inputs/DatePickerCalendar';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {CalendarPickerProps} from 'react-native-calendar-picker';

type Props = {
  currentId: string;
  isErrorHidden?: boolean;
  containerStyles?: StyleProp<ViewStyle>;
  inputTextStyles?: StyleProp<TextStyle>;
  calendarPickerProps?: CalendarPickerProps;
} & CalendarPickerProps;

export const DatePickerCalendarContext = ({
  currentId,
  isErrorHidden,
  containerStyles,
  inputTextStyles,
  ...rest
}: Props) => {
  const {
    control,
    formState: {errors},
  } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        name={currentId}
        render={({field: {onChange, value}}) => (
          <DatePickerCalendar
            selectedDate={value ?? new Date()}
            onSelectDate={onChange}
            containerStyles={[
              containerStyles,
              errors[currentId] ? {borderColor: COLORS.error} : {},
            ]}
            inputTextStyles={inputTextStyles}
            {...rest}
          />
        )}
      />

      {/* Puedes mostrar errores si lo necesitas */}
      {/* 
      <InputErrorMsg
        message={getInputIdFormContext(errors, currentId)?.message}
        isHidden={isErrorHidden}
      /> 
      */}
    </>
  );
};
