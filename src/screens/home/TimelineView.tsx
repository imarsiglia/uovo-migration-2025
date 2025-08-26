import {COLORS} from '@styles/colors';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';

import {
  PAUSED_STATUS,
  STARTED_STATUS,
  WO_DEFAULT_NAME,
} from '@api/contants/constants';
import {useGetCalendar, useGetTimeline} from '@api/hooks/HooksJobServices';
import {JobType} from '@api/types/Jobs';
import {PlaceholderCard} from '@components/timeline/PlaceholderCard';
import {TimelineCard} from '@components/timeline/TimelineCard';
import {useAuth} from '@store/auth';
import useGeneralStore from '@store/general';
import {getFormattedDate} from '@utils/functions';
import {Agenda, DateData} from 'react-native-calendars';
import {FAIconType} from 'src/types/general';

export const TimelineView = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    getFormattedDate(new Date(), 'YYYY-MM-DD'),
  );

  const refAgenda = useRef<any>(null);
  const sessionUser = useAuth((d) => d.user);
  const {isFilterActive, timelinePressed} = useGeneralStore();

  const {data: dataCalendar, isLoading: isLoadingCalendar} = useGetCalendar();
  const {data: dataTimeline, isLoading: isLoadingTimeline} = useGetTimeline(
    selectedDate!,
  );

  useEffect(() => {
    collapseAgenda();
  }, [timelinePressed]);

  const collapseAgenda = useCallback(() => {
    const a = refAgenda.current;
    if (!a) return;
    if (
      !a.state?.calendarIsReady ||
      !a.initialScrollPadPosition ||
      !a.setScrollPadPosition
    ) {
      requestAnimationFrame(() => collapseAgenda());
      return;
    }

    const closedY = a.initialScrollPadPosition();
    a.setScrollPadPosition(closedY, true);
    a.setState?.({calendarScrollable: false});
    const day = a.state?.selectedDay?.clone?.() ?? a.state?.topDay?.clone?.();
    a.calendar?.scrollToDay?.(day, a.calendarOffset?.(), true);
  }, []);

  const handleItemPress = useCallback((id: string) => {}, []);

  function onDayPress(date: DateData, sync = false) {
    setSelectedDate(date.dateString);
  }

  const renderItem = useCallback(
    (item: JobType & {__dateFmt?: string; statusOwn?: boolean}) =>
      item.type == 'job' ? (
        <PlaceholderCard
          title_instructions={item.wo_title}
          instructions={item.wo_title}
          date={item.__dateFmt}
          crUpdate={item.cr_update}
          scheduled_on={item.scheduled_on}
          status={item.wo_status ?? WO_DEFAULT_NAME}
          jobQueue={false}
          paused={item.paused}
          prepped={item.prepped}
        />
      ) : (
        <TimelineCard
          id={item.id}
          name={`${item.wo_order} ${item.client_name?.substring(
            item.client_name.indexOf(' '),
          )}`}
          paused={item.paused}
          prepped={item.prepped}
          statusOwn={item.statusOwn}
          date={item.__dateFmt!} // <- usa preformateada
          bolSended={item.bol_sended}
          crUpdate={item.cr_update}
          icon={item.icon}
          iconColor={item.icon_color}
          iconType={item.icon_type as FAIconType}
          instructions={item.wo_title}
          item={item.total_items}
          manager={item.account_manager_name}
          onPress={handleItemPress}
          signatureBolCount={item.signature_bol_count}
          status={item.wo_status ?? WO_DEFAULT_NAME}
          title_instructions={item.wo_title}
          wo_type={item.job_type_desc}
          jobQueue={false}
          isFilterActive={isFilterActive}
        />
      ),
    [handleItemPress, isFilterActive],
  );

  const renderDay = useCallback(() => <></>, []);
  const renderEmptyDate = useCallback(
    () => <View style={{backgroundColor: '#fafafa', height: '100%'}} />,
    [],
  );
  const renderEmptyData = useCallback(
    () => (
      <View style={styles.emptyData}>
        {isLoadingTimeline && (
          <ActivityIndicator
            style={{position: 'absolute', top: '30%', left: 0, right: 0}}
            size="large"
            color={COLORS.primary}
          />
        )}
      </View>
    ),
    [isLoadingTimeline],
  );

  const renderKnob = useCallback(() => <View style={styles.knobAgenda} />, []);

  const theme = useMemo(
    () => ({
      agendaKnobColor: 'blue',
      dayTextColor: '#3C424A',
      dotColor: '#CA65FF',
      selectedDayBackgroundColor: '#487EFD',
      selectedDotColor: '#FFF565',
    }),
    [],
  );

  const markedDates = useMemo(() => {
    if (!dataCalendar) {
      return {};
    }
    return dataCalendar.reduce((acc, date) => {
      acc[date] = {
        marked: true,
        selected: false,
      };
      return acc;
    }, {} as Record<string, any>);
  }, [dataCalendar]);

  const formattedItems = useMemo(() => {
    if (!dataTimeline?.length) return {};

    const base = isFilterActive
      ? dataTimeline.filter((job) =>
          job.crew?.some(
            (c) =>
              c.id_user === sessionUser!.user_id &&
              (c.status === STARTED_STATUS || c.status === PAUSED_STATUS),
          ),
        )
      : dataTimeline;

    // Agrupar por fecha y preformatear la etiqueta de fecha
    return base.reduce<Record<string, JobType[]>>((acc, job) => {
      const key = job.scheduled_on.split('T')[0];
      const withFmt = {
        ...job,
        __dateFmt: getFormattedDate(
          job.scheduled_on,
          'dddd MMM DD [•] HH:mm A',
        ),
        statusOwn: job.crew?.some(
          (x) => x.id_user == sessionUser?.user_id && x.status == PAUSED_STATUS,
        ),
      } as JobType & {__dateFmt: string};
      (acc[key] ??= []).push(withFmt);
      return acc;
    }, {});
  }, [dataTimeline, isFilterActive, sessionUser?.user_id]);

  if (isLoadingCalendar) {
    return <View style={styles.emptyData} />;
    // <LoadingModal isVisible={loadingInitial} />
  }

  return (
    <>
      <Agenda
        ref={refAgenda}
        markedDates={markedDates}
        items={formattedItems}
        onDayPress={onDayPress}
        pastScrollRange={6}
        futureScrollRange={12}
        renderDay={renderDay}
        renderEmptyDate={renderEmptyDate}
        renderKnob={renderKnob}
        renderItem={renderItem}
        renderEmptyData={renderEmptyData}
        theme={theme}
        style={styles.agenda}
      />
    </>
  );
};

const styles = StyleSheet.create({
  knobAgenda: {
    position: 'absolute',
    bottom: -15,
    width: 70,
    borderRadius: 50,
    height: 4,
    backgroundColor: COLORS.gray,
    alignSelf: 'center',
  },
  agenda: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: '#fafafa',
    width: '100%',
  },
  emptyData: {
    backgroundColor: '#fafafa',
    flex: 1,
  },
});
