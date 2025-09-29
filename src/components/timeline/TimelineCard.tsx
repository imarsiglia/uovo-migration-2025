import {
  GLOBAL_FONT_SIZE_MULTIPLIER_MD,
  PAUSED_STATUS,
  REPREPPED_STATUS,
  STARTED_STATUS,
  WO_CONFIRMED_STATUS,
} from '@api/contants/constants';
import {Label} from '@components/commons/text/Label';
import {SelectableText} from '@components/commons/text/SelectableText';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {BolCountVisualize} from '@components/jobs/bol/BolCountVisualize';
import {FAIconType} from '@generalTypes/general';
import {COLORS, ICON_COLORS, IconColorKeys} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getGroupStatusType, getUserStatusType} from '@utils/functions';
import {memo, useCallback} from 'react';
import {Platform, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

type Props = {
  id: number;
  name: string;
  title_instructions: string;
  instructions: string;
  manager: string;
  item: number;
  date: string;
  wo_type: string;
  status: string;
  crUpdate: boolean;
  prepped: boolean;
  jobQueue: boolean;
  paused: boolean;
  icon: string;
  iconColor: string;
  iconType: FAIconType;
  statusOwn?: boolean;
  signatureBolCount: number;
  bolSended: boolean;
  isFilterActive?: boolean;
  isOnline?: boolean;
  onPress: (id: number) => void;
  userStatus?: string;
};

const TimelineCardCmp = ({
  id,
  name,
  onPress,
  title_instructions,
  instructions,
  manager,
  item,
  date,
  wo_type,
  status,
  crUpdate,
  prepped,
  jobQueue,
  paused,
  icon,
  iconColor,
  iconType,
  statusOwn,
  signatureBolCount,
  bolSended,
  isFilterActive,
  isOnline,
  userStatus,
}: Props) => {
  const handleTopSheetPress = useCallback(() => onPress(id), [onPress, id]);

  return (
    <Wrapper style={style.container}>
      <Wrapper
        style={[
          style.cornerRigthCard,
          {
            backgroundColor: !isFilterActive
              ? 'white'
              : statusOwn
              ? 'yellow'
              : !statusOwn
              ? 'green'
              : 'white',
          },
        ]}>
        <Wrapper
          style={[
            style.card,
            {
              borderTopRightRadius: isFilterActive ? 40 : 10,
              borderLeftColor: crUpdate
                ? 'red'
                : status.includes(REPREPPED_STATUS)
                ? COLORS.reprepped
                : paused
                ? COLORS.pausedIcon
                : prepped
                ? COLORS.prepped
                : COLORS.placeholderInput,
              borderLeftWidth:
                crUpdate ||
                prepped ||
                paused ||
                status.includes(REPREPPED_STATUS)
                  ? 8
                  : !jobQueue
                  ? 0
                  : 0.5,
              borderRightColor: COLORS.placeholderInput,
              borderRightWidth: !jobQueue ? 0 : 0.5,
            },
            style.shadow,
          ]}>
          <Wrapper
            style={[
              style.child,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 10,
              },
            ]}>
            <Wrapper style={{flexDirection: 'column', width: '90%'}}>
              {name != null && <Label style={style.text}>{name}</Label>}
              <Label style={style.subtitle}>{date}</Label>

              <Wrapper style={[GLOBAL_STYLES.row, {gap: 15, marginTop: 5}]}>
                <Wrapper style={style.containerTypeStatus}>
                  <Label
                    style={style.textStatus}
                    maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_MD}>
                    Group status
                  </Label>
                  <Wrapper
                    style={[
                      style.containerStatus,
                      containerByVisual[getGroupStatusType(isOnline, status)],
                      // isOnline
                      //   ? status == WO_CONFIRMED_STATUS ||
                      //     status === 'Scheduled' ||
                      //     status.includes(STARTED_STATUS)
                      //     ? style.scheduled
                      //     : status.includes(PAUSED_STATUS)
                      //     ? style.paused
                      //     : status.includes(REPREPPED_STATUS)
                      //     ? style.reprepped
                      //     : style.canceled
                      //   : style.offline,
                    ]}>
                    <Label
                      style={
                        labelByVisual[getGroupStatusType(isOnline, status)]
                        // isOnline
                        //   ? status == WO_CONFIRMED_STATUS ||
                        //     status === 'Scheduled' ||
                        //     status.includes(STARTED_STATUS)
                        //     ? style.scheduled_text
                        //     : status.includes(PAUSED_STATUS)
                        //     ? style.paused_text
                        //     : status.includes(REPREPPED_STATUS)
                        //     ? style.reprepped_text
                        //     : style.canceled_text
                        //   : style.offline_text
                      }>
                      {!isOnline ? 'Offline' : status}
                    </Label>
                  </Wrapper>
                </Wrapper>

                {!!userStatus && (
                  <Wrapper style={style.containerTypeStatus}>
                    <Label
                      style={style.textStatus}
                      maxFontSizeMultiplier={GLOBAL_FONT_SIZE_MULTIPLIER_MD}>
                      Group status
                    </Label>
                    <Wrapper
                      style={[
                        style.containerStatus,
                        containerByVisual[getUserStatusType(userStatus)],
                      ]}>
                      <Label
                        style={labelByVisual[getUserStatusType(userStatus)]}>
                        {userStatus}
                      </Label>
                    </Wrapper>
                  </Wrapper>
                )}
              </Wrapper>
            </Wrapper>

            {icon != null && (
              <Wrapper
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: '10%',
                }}>
                <Icon
                  type={iconType ? iconType : 'solid'}
                  name={icon}
                  size={30}
                  color={
                    iconColor ??
                    ICON_COLORS[icon as IconColorKeys] ??
                    COLORS.primary
                  }
                />
              </Wrapper>
            )}
          </Wrapper>
          <Wrapper style={style.line} />

          {
            <Wrapper
              style={[
                style.flex,
                {
                  alignItems: 'center',
                  paddingLeft: 10,
                },
              ]}>
              <Label style={style.collect}>{title_instructions}</Label>

              <Label style={style.receive}>
                {wo_type ? wo_type : 'Undefined WO Type'}
              </Label>
            </Wrapper>
          }

          {(!jobQueue || (jobQueue && instructions)) && (
            <ScrollView
              style={[
                style.note,
                {
                  flexGrow: 1,
                  paddingLeft: 10,
                  maxHeight: 85,
                },
              ]}
              nestedScrollEnabled={true}>
              <Label style={{fontSize: 14, marginBottom: 5, fontWeight: '500'}}>
                Dispatcher notes:
              </Label>
              <SelectableText style={{fontSize: 13, color: '#707070'}}>
                {instructions ?? 'N/A'}
              </SelectableText>
            </ScrollView>
          )}

          {!jobQueue && (
            <Wrapper style={[style.child, style.flex, {paddingLeft: 10}]}>
              <Label style={style.manager}>
                Account manager: {manager ? '\n' + manager : 'N/A'}
              </Label>

              <Label style={style.items}>{item} Items</Label>
            </Wrapper>
          )}

          <Wrapper style={[style.flex2, {paddingLeft: 10}]}>
            <TouchableOpacity onPress={handleTopSheetPress}>
              <Wrapper
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.primary,
                  paddingLeft: 13,
                  paddingRight: 13,
                  borderRadius: 20,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
                <Label
                  style={[
                    style.collect,
                    {color: 'white', fontSize: 13, marginRight: 5},
                  ]}>
                  Top sheet
                </Label>

                <Icon name="eye" type="solid" size={18} color="white" />
              </Wrapper>
            </TouchableOpacity>

            <BolCountVisualize
              signatureBolCount={signatureBolCount}
              bolSended={bolSended}
            />
          </Wrapper>
        </Wrapper>
      </Wrapper>
    </Wrapper>
  );
};

const style = StyleSheet.create({
  manager: {
    fontSize: 13,
  },
  note: {
    backgroundColor: '#F3F3F3',
    marginBottom: 5,
    marginTop: 5,
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  receive: {
    color: '#707070',
    fontWeight: 'bold',
    fontSize: 12,
  },
  items: {
    color: '#707070',
    fontWeight: '300',
    fontSize: 12,
  },
  collect: {
    color: '#707070',
    fontSize: 14,
    fontWeight: '400',
    maxWidth: 150,
  },
  text: {
    color: '#464646',
    fontWeight: 'bold',
    fontSize: 14,
  },
  line: {
    borderBottomWidth: 1,
    marginTop: 13,
    borderColor: '#F7F5F4',
  },
  child: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  flex: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  flex2: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 0,
    fontWeight: '300',
    color: '#464646',
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    maxWidth: 380,
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    marginTop: 0,
    marginBottom: 0,
    elevation: 2,
  },
  cornerRigthCard: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scheduled: {
    backgroundColor: COLORS.scheduledLight,
    borderColor: COLORS.scheduled,
  },
  scheduled_text: {
    fontSize: 12,
    color: COLORS.scheduled,
  },
  canceled: {
    backgroundColor: COLORS.canceledLight,
    borderColor: COLORS.canceled,
  },
  canceled_text: {
    fontSize: 12,
    color: COLORS.canceled,
  },
  reprepped: {
    backgroundColor: COLORS.repreppedLight,
    borderColor: COLORS.reprepped,
  },
  reprepped_text: {
    fontSize: 12,
    color: COLORS.reprepped,
  },
  paused: {
    backgroundColor: COLORS.pausedLight,
    borderColor: COLORS.paused,
  },
  paused_text: {
    fontSize: 12,
    color: COLORS.paused,
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
  offline: {
    backgroundColor: 'black',
  },
  offline_text: {
    fontSize: 12,
    color: 'white',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: 'red',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
          height: 3,
          width: 0,
        },
      },
      android: {
        elevation: 5,
      },
    }),
  },
  container: {
    paddingHorizontal: 10,
  },
  textStatus: {
    fontSize: 12,
    color: '#2c2c2c',
  },
  containerTypeStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const TimelineCard = memo(
  TimelineCardCmp,
  (a, b) =>
    a.id === b.id &&
    a.status === b.status &&
    a.paused === b.paused &&
    a.prepped === b.prepped &&
    a.crUpdate === b.crUpdate &&
    a.signatureBolCount === b.signatureBolCount &&
    a.bolSended === b.bolSended &&
    a.name === b.name &&
    a.title_instructions === b.title_instructions &&
    a.instructions === b.instructions &&
    a.manager === b.manager &&
    a.item === b.item &&
    a.wo_type === b.wo_type &&
    a.date === b.date &&
    a.icon === b.icon &&
    a.iconColor === b.iconColor &&
    a.iconType === b.iconType &&
    a.statusOwn === b.statusOwn &&
    a.jobQueue === b.jobQueue &&
    a.isFilterActive === b.isFilterActive &&
    a.isOnline === b.isOnline &&
    a.userStatus === b.userStatus,
);

const containerByVisual: Record<
  'offline' | 'scheduled' | 'paused' | 'reprepped' | 'canceled',
  any
> = {
  offline: style.offline,
  scheduled: style.scheduled,
  paused: style.paused,
  reprepped: style.reprepped,
  canceled: style.canceled,
};

const labelByVisual: Record<
  'offline' | 'scheduled' | 'paused' | 'reprepped' | 'canceled',
  any
> = {
  offline: style.offline_text,
  scheduled: style.scheduled_text,
  paused: style.paused_text,
  reprepped: style.reprepped_text,
  canceled: style.canceled_text,
};
