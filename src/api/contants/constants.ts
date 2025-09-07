export const QUERY_KEYS = {
  CALENDAR: 'calendar_timeline',
  TIMELINE: 'job_timeline',
  WO_STATUS_LIST: 'wo_status_list',
  WO_TYPE_LIST: 'wo_type_list',
  LOCATION_PLACES: 'location_places',
  JOB_QUEUE_LIST: 'job_queue_list',
  NS_LOCATION_PLACES: 'ns_location_places',
  NS_EAST_COAST_PICKUP: 'ns_east_coast_pickup',
  NS_WEST_COAST_PICKUP: 'ns_west_coast_pickup',
  NS_EAST_COAST_DROPOFF: 'ns_east_coast_dropoff',
  NS_WEST_COAST_DROPOFF: 'ns_west_coast_dropoff',
  NS_INVENTORY_EAST_COAST_PICKUP: 'ns_inventory_east_coast_pickup',
  NS_INVENTORY_WEST_COAST_PICKUP: 'ns_inventory_west_coast_pickup',
  NS_INVENTORY_WEST_COAST_DROPOFF: 'ns_inventory_west_coast_dropoff',
  NS_INVENTORY_EAST_COAST_DROPOFF: 'ns_inventory_east_coast_dropoff',
  NS_UNIQUE_ROUTE_PICKUP: 'ns_unique_route_pickup',
  NS_UNIQUE_ROUTE_DROPOFF: 'ns_unique_route_dropoff',
  NS_INVENTORY_UNIQUE_ROUTE_PICKUP: 'ns_inventory_unique_route_pickup',
  NS_INVENTORY_UNIQUE_ROUTE_DROPOFF: 'ns_inventory_unique_route_dropoff',
  TOPSHEET: 'topsheet',
  GEOLOCATION_ADDRESS: 'geolocation_address',
  LOCATION_LETSGO: 'location_letsgo',
  LOCATION_NOTES: 'location_notes',
  TASK_COUNT: 'task_count',
  QR_USER: 'qr_user',
  SIGNATURES: 'signatures',
  NOTES: 'NOTES',
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

// TOPSHEET CREW MEMBER
export const STARTED_STATUS_CREW = 'STARTED';
export const PAUSED_STATUS_CREW = 'PAUSED';
export const FINALIZED_STATUS_CREW = 'FINALIZED';
export const STARTED_COLOR_CREW = '#00ff00';
export const PAUSED_COLOR_CREW = '#ffff00';
export const FINALIZED_COLOR_CREW = '#ff0000';
export const INITIAL_COLOR_CREW = '#f3f3f3';

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
} as const;

export type StatusNationalShuttleTye = keyof typeof STATUS_NATIONAL_SHUTTLE;

export const FILTER_TYPES_ACTIVITY = [
  {
    id: NATIONAL_SHUTTLE_TYPE.EAST_COAST_PICKUP,
    label: 'East Coast Pickup',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.EAST_COAST_DROPOFF,
    label: 'East Coast Dropoff',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.WEST_COAST_PICKUP,
    label: 'West Coast Pickup',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.WEST_COAST_DROPOFF,
    label: 'West Coast Dropoff',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_PICKUP,
    label: 'Unique Route Pickup',
  },
  {
    id: NATIONAL_SHUTTLE_TYPE.UNIQUE_ROUTE_DROPOFF,
    label: 'Unique Route Dropoff',
  },
];

// location navigation
export type LatLng = {lat: number; lng: number};

type IOSNavCandidateType = LatLng & {
  label?: string;
};

export type IOSNavCandidate = {
  id: string; // identificador interno
  name: string; // texto que verá el usuario
  scheme: string; // p.ej. 'comgooglemaps://'
  buildURL: (p: LatLng & {label?: string}) => string; // deep link final
};

export const CANDIDATES_IOS: IOSNavCandidate[] = [
  {
    id: 'google-maps',
    name: 'Google Maps',
    scheme: 'comgooglemaps://',
    buildURL: ({lat, lng, label}: IOSNavCandidateType) =>
      `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving${
        label ? `&q=${encodeURIComponent(label)}` : ''
      }`,
  },
  {
    id: 'waze',
    name: 'Waze',
    scheme: 'waze://',
    buildURL: ({lat, lng}: IOSNavCandidateType) =>
      `waze://?ll=${lat},${lng}&navigate=yes`,
  },
  {
    id: 'citymapper',
    name: 'Citymapper',
    scheme: 'citymapper://',
    buildURL: ({lat, lng, label}: IOSNavCandidateType) =>
      `citymapper://directions?endcoord=${lat},${lng}${
        label ? `&endname=${encodeURIComponent(label)}` : ''
      }`,
  },
  {
    id: 'yandex',
    name: 'Yandex Navigator',
    scheme: 'yandexnavi://',
    buildURL: ({lat, lng}: IOSNavCandidateType) =>
      `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`,
  },
  {
    id: 'sygic',
    name: 'Sygic',
    scheme: 'com.sygic.aura://',
    buildURL: ({lat, lng}: IOSNavCandidateType) =>
      `com.sygic.aura://coordinate|${lat},${lng}?action=drive`,
  },
  {
    id: 'mapsme',
    name: 'MAPS.ME',
    scheme: 'mapsme://',
    buildURL: ({lat, lng, label}: IOSNavCandidateType) =>
      `mapsme://route?sll=${lat},${lng}&dll=${lat},${lng}${
        label ? `&daddr=${encodeURIComponent(label)}` : ''
      }`,
  },
  {
    id: 'tomtom',
    name: 'TomTom',
    scheme: 'tomtomhome://',
    buildURL: ({lat, lng}: IOSNavCandidateType) =>
      `tomtomhome://geo:action=show&lat=${lat}&long=${lng}`,
  },
];

// signatures
export const SIGNER_TYPES = [
  {
    id: 'SHIPPER',
    name: 'Shipper',
  },
  {
    id: 'CARRIER',
    name: 'Carrier',
  },
  {
    id: 'CONSIGNEE',
    name: 'Consignee',
  },
];
