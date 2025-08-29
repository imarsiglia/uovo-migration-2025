import {GeneralListApi} from '@api/services/generalServices';

export const QUERY_KEYS = {
  CALENDAR: 'calendar_timeline',
  TIMELINE: 'job_timeline',
  WO_STATUS_LIST: 'wo_status_list',
  WO_TYPE_LIST: 'wo_type_list',
  LOCATION_PLACES: 'location_places',
  JOB_QUEUE_LIST: 'job_queue_list',
};

export const WO_DEFAULT_NAME = 'WO Confirmed';
export const WO_TYPE_PLACEHOLDER = 'placeholder';

// JOB STATES
export const WO_CONFIRMED_STATUS = 'WO Confirmed';
export const STARTED_STATUS = 'Started';
export const PAUSED_STATUS = 'Paused';
export const FINALIZED_STATUS = 'Finalized';
export const REPREPPED_STATUS = 'Inventory Updated';

// JOB QUEUE FILTERS
export const JOBQUEUE_STATUS = 'STATUS';
export const JOBQUEUE_WOTYPE = 'WOTYPE';
export const JOBQUEUE_CLIENT = 'CLIENT';
export const JOBQUEUE_START_DATE = 'START_DATE';
export const JOBQUEUE_WO_NUMBER = 'WO_NUMBER';

export const JOB_QUEUE_FILTER_LIST = [
  {
    id: JOBQUEUE_STATUS,
    name: 'Status',
  },
  {
    id: JOBQUEUE_WOTYPE,
    name: 'WO Type',
  },
  {
    id: JOBQUEUE_CLIENT,
    name: 'Client',
  },
  {
    id: JOBQUEUE_START_DATE,
    name: 'Start Date',
  },
  {
    id: JOBQUEUE_WO_NUMBER,
    name: 'WO Number',
  },
];

export const JOBQUEUE_ORDER_BY_TYPES = Object.fromEntries(
  JOB_QUEUE_FILTER_LIST.map(({id, name}) => [id, name]),
);

export const DEFAULT_WO_STATUS_LIST: string[] = [
  'Finalized',
  'Paused',
  'Started',
  'WO Confirmed',
];

export const DEFAULT_WO_TYPE_LIST: string[] = [
  'Crate Disposal',
  'Display',
  'Inventory',
  'Receive - External',
  'Receive - Internal',
  'Release - External',
  'Inventory',
  'Release - Internal',
  'Shipping Service',
  'Trash Disposal',
];

export const FILTER_WO_ACTIVE = 'WO_ACTIVE';

// NATIONAL SHUTTLE
export const NATIONAL_SHUTTLE_TYPE = {
  EAST_COAST_PICKUP: 'east_coast_pickup',
  WEST_COAST_PICKUP: 'west_coast_pickup',
  EAST_COAST_DROPOFF: 'east_coast_dropoff',
  WEST_COAST_DROPOFF: 'west_coast_dropoff',
  UNIQUE_ROUTE_PICKUP: 'unique_route_pickup',
  UNIQUE_ROUTE_DROPOFF: 'unique_route_dropoff',
};

export const STATUS_NATIONAL_SHUTTLE = {
  UNLOADED: {
    color: '#FE4F4F',
  },
  LOADED: {
    color: '#4FFE76',
  },
  INPROGRESS: {
    color: '#EEDC42',
  },
  NOITEMS: {
    color: 'transparent',
  },
  DEFAULT: {
    color: 'gray',
  },
};
