import {useMemo, useRef, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import CalendarPicker, { CustomDayHeaderStylesFunc } from 'react-native-calendar-picker';
import Modal from 'react-native-modal';
import Icon from 'react-native-fontawesome-pro';
import { getFormattedDate } from '@utils/functions';
import { COLORS } from '@styles/colors';
import { Icons } from '@assets/icons/icons';
import { PressableOpacity } from '@components/commons/buttons/PressableOpacity';
import { Wrapper } from '@components/commons/wrappers/Wrapper';

export const DatePickerCalendar = ({
  selectedDate = new Date(),
  onSelectDate,
  containerStyles,
  inputTextStyles,
}: {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  containerStyles?: StyleProp<ViewStyle>;
  inputTextStyles?: StyleProp<TextStyle>;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [temporalDate, setTemporalDate] = useState<Date>(
    new Date(selectedDate.getTime()),
  );

  const isToday = useMemo(() => {
    return isDateToday(selectedDate);
  }, [selectedDate]);

  const closePicker = () => {
    setIsVisible(false);
  };

  const openPicker = () => {
    setTemporalDate(new Date(selectedDate.getTime()));
    setIsVisible(true);
  };

  const onChangeDate = (date: any) => {
    setTemporalDate(new Date(date));
  };

  const confirmDate = () => {
    onSelectDate(new Date(temporalDate.getTime()));
    closePicker();
  };

  const customDayHeaderStylesCallback:CustomDayHeaderStylesFunc | undefined = ({dayOfWeek, month, year}) => {
    return {
      textStyle: {
        fontSize: 14,
        color: '#3C3C4390',
        textTransform: 'uppercase',
      },
    };
  };

  const customDatesStylesCallback = () => {
    return {
      containerStyles: {height: 20},
      style: {width: 40, height: 40},
      textStyle: {
        fontSize: 16,
        color: "#3E3E3E"
      },
    };
  };

  return (
    <Wrapper>
      <PressableOpacity
        style={[
          styles.inputText,
          containerStyles,
          {
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
        onPress={openPicker}>
        <Text style={[styles.inputTextLabel, inputTextStyles]}>
          {getFormattedDate(selectedDate, 'MM/DD/YYYY')}
          {isToday ? ' (Today)' : ''}
        </Text>
        <Icons.CalendarIcon color={'#4F46E5'} />
      </PressableOpacity>
      <Modal isVisible={isVisible} backdropOpacity={0.5}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingTop: 10,
            backgroundColor: 'white',
            borderRadius: 10,
            position: 'relative',
            width: '100%',
          }}>
          <View style={{height: 310}}>
            <CalendarPicker
              monthTitleStyle={{fontSize: 18}}
              yearTitleStyle={{fontSize: 18}}
              onDateChange={onChangeDate}
              selectedDayStyle={{
                width: 40,
                height: 40,
                backgroundColor: COLORS.primary,
              }}
              width={Dimensions.get('window').width - 20}
              selectedDayColor={COLORS.primary}
              selectedDayTextColor="white"
              initialDate={temporalDate}
              selectedStartDate={temporalDate}
              customDatesStyles={customDatesStylesCallback}
              customDayHeaderStyles={customDayHeaderStylesCallback}
              dayLabelsWrapper={{borderTopWidth: 0, borderBottomWidth: 0}}
              // @ts-ignore
              styles={{
                selectedToday: {backgroundColor: 'red', width: 50, height: 60},
              }}
              previousComponent={
                <View style={{marginLeft: 10}}>
                  <Icon name="angle-left" size={28} color="#3E3E3E" />
                </View>
              }
              nextComponent={
                <View style={{marginRight: 10}}>
                  <Icon name="angle-right" size={28} color="#3E3E3E" />
                </View>
              }
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 10,
            }}>
            <TouchableOpacity
              style={[
                styles.buttonAction,
                {borderEndColor: '#80808050', borderEndWidth: 1},
              ]}
              onPress={closePicker}>
              <Text style={styles.textAction}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonAction]}
              onPress={confirmDate}>
              <Text style={styles.textAction}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  inputText: {
    backgroundColor: 'white',
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: COLORS.borderInputColor,
    paddingHorizontal: 8,
    height: 40,
    verticalAlign: 'middle',
    justifyContent: 'center',
  },
  inputTextLabel: {
    color: '#8B8C8E',
  },
  buttonAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  textAction: {
    color: COLORS.primary,
  },
});

function isDateToday(date: Date) {
  const todayDayte = new Date();
  todayDayte.setHours(0, 0, 0, 0);
  const receivedDate = new Date(date.getTime());
  receivedDate.setHours(0, 0, 0, 0);
  return todayDayte.getTime() === receivedDate.getTime();
}
