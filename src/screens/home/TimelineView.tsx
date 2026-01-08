import {COLORS} from '@styles/colors';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {
  PAUSED_STATUS,
  STARTED_STATUS,
  WO_DEFAULT_NAME,
  WO_TYPE_PLACEHOLDER,
} from '@api/contants/constants';
import {useGetCalendar, useGetTimeline} from '@api/hooks/HooksJobServices';
import {JobType} from '@api/types/Jobs';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {PlaceholderCard} from '@components/timeline/PlaceholderCard';
import {TimelineCard} from '@components/timeline/TimelineCard';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useOnline} from '@hooks/useOnline';
import {RoutesNavigation} from '@navigation/types';
import {useAuth} from '@store/auth';
import useGeneralStore from '@store/general';
import {getFormattedDate, nextFrame} from '@utils/functions';
import {Agenda, DateData} from 'react-native-calendars';
import {FAIconType} from 'src/types/general';
import {useFocusEffect} from '@react-navigation/native';

export const TimelineViewCmp = () => {
  const refAgenda = useRef<any>(null);
  const [isAgendaReady, setIsAgendaReady] = useState(false);
  const sessionUser = useAuth((d) => d.user);
  const {
    isFilterActive,
    timelinePressed,
    selectedDate,
    setSelectedDate,
    activeTab,
  } = useGeneralStore();
  const {online} = useOnline();
  const {navigate, isFocused} = useCustomNavigation();

  const [mounted, setMounted] = useState(0);
  const {data: dataCalendar} = useGetCalendar();

  const increaseMounted = useCallback(() => {
    setMounted((v) => v + 1);
  }, []);

  const {
    data: dataTimeline,
    isLoading: isLoadingTimeline,
    refetch,
  } = useGetTimeline(selectedDate!);

  useEffect(() => {
    return () => {
      setSelectedDate(getFormattedDate(new Date(), 'YYYY-MM-DD'));
    };
  }, []);

  useEffect(() => {
    if (!isAgendaReady) return;
    setTimeout(() => {
      setSelectedDate(getFormattedDate(new Date(), 'YYYY-MM-DD'));
      increaseMounted();
    }, 1000);
  }, [isAgendaReady]);

  useEffect(() => {
    if (!isAgendaReady) return;

    const timer = setTimeout(() => {
      collapseAgenda();
    }, 100);

    return () => clearTimeout(timer);
  }, [isAgendaReady]);

  useEffect(() => {
    if (timelinePressed) {
      collapseAgenda();
      if (activeTab == 0) {
        setTimeout(() => {
          increaseMounted();
        }, 500);
      }
    }
  }, [timelinePressed, increaseMounted]);

  useEffect(() => {
    setTimeout(() => {
      initialRefetch();
    }, 700);
  }, []);

  const initialRefetch = useCallback(() => {
    if (selectedDate) {
      refetch();
    }
  }, [selectedDate]);

  // Detectar cuando Agenda está listo
  useEffect(() => {
    const checkAgendaReady = () => {
      const a = refAgenda.current;
      if (a?.state?.calendarIsReady) {
        setIsAgendaReady(true);
      } else {
        requestAnimationFrame(checkAgendaReady);
      }
    };

    const timer = setTimeout(checkAgendaReady, 300);
    return () => clearTimeout(timer);
  }, []);

  const collapseAgenda = useCallback(() => {
    const a = refAgenda.current;
    if (!a) return;

    try {
      if (
        !a.state?.calendarIsReady ||
        !a.initialScrollPadPosition ||
        !a.setScrollPadPosition
      ) {
        return;
      }

      const closedY = a.initialScrollPadPosition();
      a.setScrollPadPosition(closedY, true);
      a.setState?.({calendarScrollable: false});

      const day = a.state?.selectedDay?.clone?.() ?? a.state?.topDay?.clone?.();
      if (day && a.calendar?.scrollToDay) {
        a.calendar.scrollToDay(day, a.calendarOffset?.(), true);
      }
    } catch (error) {
      console.warn('Error collapsing agenda:', error);
    }
  }, []);

  const handleItemPress = useCallback(
    (id: number) => {
      navigate(RoutesNavigation.Topsheet, {
        id: id as never as string,
        queue: 0,
      });
      setTimeout(() => {
        increaseMounted();
      }, 1000);
    },
    [navigate, increaseMounted],
  );

  const onDayPress = useCallback(
    async (date: DateData) => {
      await nextFrame();
      setSelectedDate(date.dateString);
    },
    [setSelectedDate],
  );

  const renderItem = useCallback(
    (
      item: JobType & {
        __dateFmt?: string;
        statusOwn?: boolean;
        formattedName?: string;
      },
    ) => {
      if (!item) return <View />;

      return item.type == WO_TYPE_PLACEHOLDER ? (
        <PlaceholderCard
          key={`placeholder-${item.id}`}
          title_instructions={item.instructions}
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
          key={`timeline-${item.id}-${item.instructions?.length || 0}`}
          id={item.id}
          name={item.formattedName!}
          paused={item.paused}
          prepped={item.prepped}
          statusOwn={item.statusOwn}
          date={item.__dateFmt!}
          bolSended={item.bol_sended}
          crUpdate={item.cr_update}
          icon={item.icon}
          iconColor={item.icon_color}
          iconType={item.icon_type as FAIconType}
          instructions={item.instructions}
          item={item.total_items}
          manager={item.account_manager_name}
          onPress={handleItemPress}
          signatureBolCount={item.signature_bol_count}
          status={item.wo_status ?? WO_DEFAULT_NAME}
          title_instructions={item.wo_title}
          wo_type={item.job_type_desc}
          jobQueue={false}
          isFilterActive={isFilterActive}
          isOnline={online}
          userStatus={item.user_status}
        />
      );
    },
    [handleItemPress, isFilterActive, online],
  );

  const renderDay = useCallback(() => <></>, []);

  const renderEmptyDate = useCallback(
    () => <Wrapper style={{backgroundColor: '#fafafa', height: '100%'}} />,
    [],
  );

  const renderEmptyData = useCallback(
    () => (
      <Wrapper style={styles.emptyData}>
        {isLoadingTimeline && (
          <ActivityIndicator
            style={{position: 'absolute', top: '30%', left: 0, right: 0}}
            size="large"
            color={COLORS.primary}
          />
        )}
      </Wrapper>
    ),
    [isLoadingTimeline],
  );

  const renderKnob = useCallback(
    () => <Wrapper style={styles.knobAgenda} />,
    [],
  );

  const theme = useMemo(
    () => ({
      agendaKnobColor: 'blue',
      dayTextColor: '#3C424A',
      dotColor: COLORS.dotColor,
      selectedDayBackgroundColor: COLORS.primaryDark,
      selectedDotColor: COLORS.selectedDotColor,
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
    // IMPORTANTE: Siempre retornar un objeto, incluso si está vacío
    if (!dataTimeline?.length) {
      // Retornar objeto vacío con la fecha seleccionada para evitar errores
      return selectedDate ? {[selectedDate]: []} : {};
    }

    const base = isFilterActive
      ? dataTimeline.filter((job) =>
          job.crew?.some(
            (c) =>
              c.id_user === sessionUser!.user_id &&
              (c.status === STARTED_STATUS || c.status === PAUSED_STATUS),
          ),
        )
      : dataTimeline;

    // Agrupar por fecha y preformatear
    const grouped = base.reduce<Record<string, JobType[]>>((acc, job) => {
      const key = job.scheduled_on.split('T')[0];
      const withFmt = {
        ...job,
        __dateFmt: getFormattedDate(job.scheduled_on, 'dddd MMM DD • hh:mm A'),
        statusOwn: job.crew?.some(
          (x) => x.id_user == sessionUser?.user_id && x.status == PAUSED_STATUS,
        ),
        formattedName: `${job.wo_order} • ${job.client_name?.substring(
          job.client_name.indexOf(' '),
        )}`,
      } as JobType & {
        __dateFmt: string;
        statusOwn?: boolean;
        formattedName?: string;
      };

      (acc[key] ??= []).push(withFmt);
      return acc;
    }, {});

    // Asegurar que la fecha seleccionada siempre exista
    if (selectedDate && !grouped[selectedDate]) {
      grouped[selectedDate] = [];
    }

    return grouped;
  }, [dataTimeline, isFilterActive, sessionUser?.user_id, selectedDate]);

  return (
    <>
      {activeTab == 0 && (
        <Agenda
          key={`agenda-timeline`}
          ref={refAgenda}
          markedDates={markedDates}
          items={formattedItems}
          onDayPress={onDayPress}
          selected={selectedDate}
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
      )}

      {/* {isRefetching && (
        <IndicatorLoading
          containerStyle={{
            position: 'absolute',
            alignSelf: 'center',
            top: '30%',
          }}
          activityIndicatorProps={{color: COLORS.primary, size: 'large'}}
        />
      )} */}
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

export const TimelineView = memo(TimelineViewCmp);
