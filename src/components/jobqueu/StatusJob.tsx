
import { PAUSED_STATUS, REPREPPED_STATUS, STARTED_STATUS, WO_CONFIRMED_STATUS } from '@api/contants/constants';
import {StyleSheet, Text, View} from 'react-native';

export const StatusJob = ({
  offline = false,
  status  = WO_CONFIRMED_STATUS,
}: {
  offline?: boolean;
  status: string;
}) => {
  return (
    <View
      style={[
        offline
          ? style.offline
          : status == WO_CONFIRMED_STATUS ||
            status === 'Scheduled' ||
            status.includes(STARTED_STATUS)
          ? style.scheduled
          : status.includes(PAUSED_STATUS)
          ? style.paused
          : status.includes(REPREPPED_STATUS)
          ? style.reprepped
          : style.canceled,
        style.containerStatus,
      ]}>
      <Text
        style={
          offline
            ? style.offline_text
            : status == WO_CONFIRMED_STATUS ||
              status === 'Scheduled' ||
              status.includes(STARTED_STATUS)
            ? style.scheduled_text
            : status.includes(PAUSED_STATUS)
            ? style.paused_text
            : status.includes(REPREPPED_STATUS)
            ? style.reprepped_text
            : style.canceled_text
        }>
        {offline ? 'Offline' : status}
      </Text>
    </View>
  );
};
const style = StyleSheet.create({
  offline: {
    backgroundColor: 'black',
  },
  offline_text: {
    fontSize: 12,
    color: 'white',
  },
  scheduled: {
    backgroundColor: '#DFFAF4',
    borderColor: '#50E3C2',
  },
  scheduled_text: {
    fontSize: 12,
    color: '#50E3C2',
  },
  canceled: {
    backgroundColor: '#FFDCDC',
    borderColor: '#FF6161',
  },
  canceled_text: {
    fontSize: 12,
    color: '#FF6161',
  },
  reprepped: {
    backgroundColor: '#cab5ff',
    borderColor: '#512da8',
  },
  reprepped_text: {
    fontSize: 12,
    color: '#512da8',
  },
  paused: {
    backgroundColor: '#F7F5F4',
    borderColor: '#959595',
  },
  paused_text: {
    fontSize: 12,
    color: '#959595',
  },
  containerStatus: {
    marginTop: 5,
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
  },
});
