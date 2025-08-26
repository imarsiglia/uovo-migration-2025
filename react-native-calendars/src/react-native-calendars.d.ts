// react-native-calendars.d.ts
// Minimal, practical typings for Calendar, CalendarList, Agenda & helpers.
// Covers the most common props. Extend as needed.

declare module 'react-native-calendars' {
  import * as React from 'react';
  import {
    StyleProp,
    ViewStyle,
    TextStyle,
    ListRenderItemInfo,
    FlatListProps,
    ViewProps,
  } from 'react-native';

  export type DateString = string; // 'YYYY-MM-DD'
  export type MarkingType = 'simple' | 'period' | 'multi-dot' | 'multi-period' | 'custom';

  export interface DateData {
    dateString: DateString;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  }

  export interface DayProps {
    date: DateData;
    state?: 'selected' | 'disabled' | 'today' | '';
    marking?: MarkedDates[DateString] | Marking[];
    onPress?(day: DateData): void;
    onLongPress?(day: DateData): void;
  }

  export interface Theme {
    backgroundColor?: string;
    calendarBackground?: string;
    textSectionTitleColor?: string;
    selectedDayBackgroundColor?: string;
    selectedDayTextColor?: string;
    todayTextColor?: string;
    dayTextColor?: string;
    textDisabledColor?: string;
    dotColor?: string;
    selectedDotColor?: string;
    arrowColor?: string;
    disabledArrowColor?: string;
    monthTextColor?: string;
    indicatorColor?: string;
    textDayFontFamily?: string;
    textMonthFontFamily?: string;
    textDayHeaderFontFamily?: string;
    textDayFontWeight?: '100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'|string;
    textMonthFontWeight?: '100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'|string;
    textDayHeaderFontWeight?: '100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'|string;
    textDayFontSize?: number;
    textMonthFontSize?: number;
    textDayHeaderFontSize?: number;
    [key: string]: any;
  }

  export interface MarkedDateCustomStyle {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  }

  export interface Marking {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    customStyles?: MarkedDateCustomStyle;
  }

  export type MarkedDates = {
    [date in DateString]?: Marking;
  };

  export interface CalendarProps {
    /** Initially visible month (e.g. '2025-08-01') */
    current?: DateString;
    /** Minimum selectable date */
    minDate?: DateString;
    /** Maximum selectable date */
    maxDate?: DateString;
    /** Handler which gets executed on day press */
    onDayPress?(day: DateData): void;
    /** Handler which gets executed on day long press */
    onDayLongPress?(day: DateData): void;
    /** Handler when visible month changes */
    onMonthChange?(date: DateData): void;
    /** First day of week: 0 = Sunday, 1 = Monday */
    firstDay?: number;
    /** Hide days outside current month */
    hideExtraDays?: boolean;
    /** Enable swipe between months */
    enableSwipeMonths?: boolean;
    /** Month title format (moment/xdate-like) */
    monthFormat?: string;
    /** Marked dates mapping */
    markedDates?: MarkedDates;
    /** One of: 'simple' | 'period' | 'multi-dot' | 'multi-period' | 'custom' */
    markingType?: MarkingType;
    /** Theme overrides */
    theme?: Theme;
    /** Container style */
    style?: StyleProp<ViewStyle>;
    /** TestID */
    testID?: string;
    /** Render custom day component */
    dayComponent?: React.ComponentType<DayProps>;
  }

  export class Calendar extends React.Component<CalendarProps> {}

  export interface CalendarListProps extends CalendarProps {
    /** Month range before initial month to render */
    pastScrollRange?: number;
    /** Month range after initial month to render */
    futureScrollRange?: number;
    /** Horizontal scroll / paging */
    horizontal?: boolean;
    pagingEnabled?: boolean;
    /** Custom item height/width */
    calendarWidth?: number;
    calendarHeight?: number;
    /** Called when visible months change */
    onVisibleMonthsChange?(months: DateData[]): void;
    /** Show/hide scroll indicator */
    showScrollIndicator?: boolean;
  }

  export class CalendarList extends React.Component<CalendarListProps> {}

  export type AgendaSchedule<TItem = any> = {
    [date in DateString]?: TItem[];
  };

  export interface AgendaProps<TItem = any> extends CalendarProps {
    /** Items grouped by date (YYYY-MM-DD) */
    items?: AgendaSchedule<TItem>;
    /** Selected date (YYYY-MM-DD) */
    selected?: DateString;
    /** Render each agenda item */
    renderItem?(item: TItem, firstItemInDay: boolean): React.ReactElement | null;
    /** Render when date has no items */
    renderEmptyDate?(): React.ReactElement | null;
    /** Render when there is no data at all */
    renderEmptyData?(): React.ReactElement | null;
    /** Render a custom knob for the calendar */
    renderKnob?(): React.ReactElement | null;
    /** Called when the calendar is toggled (open/close) */
    onCalendarToggled?(open: boolean): void;
    /** Called when user presses a day in the calendar */
    onDayPress?(day: DateData): void;
    /** Called when day changes while scrolling the agenda list */
    onDayChange?(day: DateData): void;
    renderDay?(): React.ReactElement | null;
    /** Range of months to render before/after */
    pastScrollRange?: number;
    futureScrollRange?: number;
    /** Min/Max dates for calendar constraint */
    minDate?: DateString;
    maxDate?: DateString;
    /** Theme overrides */
    theme?: Theme;
    /** Container style */
    style?: StyleProp<ViewStyle>;
  }

  export class Agenda<TItem = any> extends React.Component<AgendaProps<TItem>> {}

  export interface LocaleConfigType {
    locales: Record<
      string,
      {
        monthNames?: string[];
        monthNamesShort?: string[];
        dayNames?: string[];
        dayNamesShort?: string[];
        today?: string;
      }
    >;
    defaultLocale: string;
  }

  export const LocaleConfig: LocaleConfigType;
}
