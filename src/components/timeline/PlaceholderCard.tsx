import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';
import {getFormattedDate} from '@utils/functions';
import {memo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  title_instructions: string;
  instructions: string;
  date?: string;
  status: string;
  crUpdate: boolean;
  prepped: boolean;
  jobQueue: boolean;
  paused: boolean;
  scheduled_on: string;
};

const PlaceholderCardCmp = ({
  title_instructions,
  instructions,
  date,
  status,
  crUpdate,
  prepped,
  jobQueue,
  paused,
  scheduled_on,
}: Props) => {
  const monthYear = getFormattedDate(scheduled_on, 'MMMM YYYY');

  return (
    <Wrapper style={style.container}>
      <View
        style={[
          style.card,
          {
            borderLeftColor: crUpdate
              ? 'red'
              : paused
              ? COLORS.pausedIcon
              : prepped
              ? COLORS.prepped
              : '#d0d0d0',
            borderLeftWidth:
              crUpdate || prepped || paused ? 8 : !jobQueue ? 0 : 0.5,
            borderRightColor: '#d0d0d0',
            borderRightWidth: !jobQueue ? 0 : 0.5,
          },
        ]}>
        <View
          style={[
            style.child,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingLeft: crUpdate || prepped ? 12 : 20,
            },
          ]}>
          <View style={{flexDirection: 'column', width: '80%'}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={[style.text, {marginRight: 5}]}>Title:</Text>
              <Text style={style.subtitle}>{title_instructions}</Text>
            </View>

            <View style={[style.containerStatus]}>
              <Text style={style.placeholder_text}>{status}</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              width: '10%',
            }}>
            <Icon
              type={'regular'}
              name="calendar-star"
              size={26}
              color={COLORS.placeholder}
            />
          </View>
        </View>
        <View style={style.line} />

        <ScrollView
          style={[
            style.note,
            {
              flexGrow: 1,
              paddingLeft: crUpdate || prepped ? 12 : 20,
              maxHeight: 77,
            },
          ]}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}>
          <Text style={[style.collect, style.text, {paddingBottom: 10}]}>
            Job Description: <Text style={style.subtitle}>{instructions}</Text>
          </Text>
        </ScrollView>

        <View style={{paddingLeft: 20}}>
          <Text style={{color: COLORS.scheduledDate}}>Scheduled date:</Text>
          <Text style={[style.collect, style.text, {marginTop: 5}]}>
            {date} {monthYear}
          </Text>
        </View>
      </View>
    </Wrapper>
  );
};

const style = StyleSheet.create({
  note: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    marginBottom: 5,
    paddingRight: 10,
  },
  collect: {
    color: '#707070',
    fontSize: 14,
    fontWeight: '400',
    maxWidth: 300,
  },
  text: {
    color: '#464646',
    fontWeight: 'bold',
    fontSize: 13,
  },
  line: {
    borderBottomWidth: 1,
    marginTop: 8,
    marginBottom: 10,
    borderColor: '#959595',
  },
  child: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 0,
    fontWeight: '300',
    color: '#808082',
  },
  card: {
    width: '100%',
    backgroundColor: '#f3f3f3',
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    paddingVertical: 12,
  },
  placeholder_text: {
    fontSize: 13,
    color: COLORS.placeholder,
  },
  containerStatus: {
    marginTop: 10,
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.placeholderBorder,
    backgroundColor: '#fadfe5',
  },
  container: {
    paddingHorizontal: 10,
  },
});

export const PlaceholderCard = memo(
  PlaceholderCardCmp,
  (a, b) =>
    a.title_instructions === b.title_instructions &&
    a.instructions === b.instructions &&
    a.status === b.status &&
    a.crUpdate === b.crUpdate &&
    a.prepped === b.prepped &&
    a.jobQueue === b.jobQueue &&
    a.paused === b.paused &&
    a.scheduled_on === b.scheduled_on &&
    a.date === b.date,
);
