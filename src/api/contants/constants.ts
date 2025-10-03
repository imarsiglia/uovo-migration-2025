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
  NOTES: 'notes',
  REPORT_MATERIALS: 'report_materials',
  HISTORY_REPORT_MATERIALS: 'history_report_materials',
  REPORT_MATERIALS_INVENTORY: 'report_materials_inventory',
  WO_ATTACHMENTS: 'wo_attachments',
  BOL_COUNT: 'bol_count',
  LABOR_REPORTS: 'labor_reports',
  EMPLOYEES: 'employees',
  LABOR_CODES: 'labor_codes',
  JOB_INVENTORY: 'job_inventory',
  SEARCH_FULL_INVENTORY: 'search_full_inventory',
  SEARCH_INVENTORY_ITEM: 'search_inventory_item',
  INVENTORY_ITEM_DETAIL: 'inventory_item_detail',
  PACKING_DETAILS: 'packing_details',
  RESUME_CONDITION_REPORT: 'resume_condition_report',
  RESUME_CONDITION_CHECK: 'resume_condition_check',
  PLACES_CONDITION_REPORT: 'places_condition_report',
  ARTISTS: 'artists',
  ART_TYPES: 'art_types',
  CONDITION_REPORT_BY_INVENTORY: 'condition_report_by_inventory',
  CONDITION_CHECK_BY_INVENTORY: 'condition_check_by_inventory',
  TOTAL_PHOTOS_CONDITION_REPORT: 'total_photos_condition_report',
  TOTAL_PHOTOS_CONDITION_CHECK: 'total_photos_condition_check',
  GET_BOL_PDF: 'get_bol_pdf',
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
} as const;

export type NationalShuttleType = typeof NATIONAL_SHUTTLE_TYPE

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

export const INVENTORY_STATUS_TYPES = {
  LOCKED_BY: 'LOCKED BY',
  COMPLETED_BY: 'COMPLETED BY',
  PROCESSING_BY: 'PROCESSING BY',
  READY_TO_TRANSPORT: 'READY TO TRANSPORT',
} as const;

export const COLUMNS_WIDTH = {
  CHECK: 40,
  ID: 90,
  ID_DISABLED: 80,
  ALT_ID: 90,
  CLIENT_REF: 100,
  LOCATION: 140,
  DIMENSIONS: 110,
  PACKING_DETAILS: 140,
  TITLE: 130,
  ARTIST: 120,
  STATUS: 100,
  CONDITION: 90,
  DELETE: 120,
  HAS_IMAGE: 90,
};

export const ROW_COLUMNS_WIDTH = {
  CHECK: COLUMNS_WIDTH.CHECK,
  ID: COLUMNS_WIDTH.ID,
  ID_DISABLED: COLUMNS_WIDTH.ID_DISABLED,
  ALT_ID: COLUMNS_WIDTH.ALT_ID,
  CLIENT_REF: COLUMNS_WIDTH.CLIENT_REF,
  LOCATION: COLUMNS_WIDTH.LOCATION,
  DIMENSIONS: COLUMNS_WIDTH.DIMENSIONS,
  PACKING_DETAILS: COLUMNS_WIDTH.PACKING_DETAILS,
  TITLE: COLUMNS_WIDTH.TITLE,
  ARTIST: COLUMNS_WIDTH.ARTIST,
  STATUS: COLUMNS_WIDTH.STATUS,
  CONDITION: COLUMNS_WIDTH.CONDITION,
  DELETE: COLUMNS_WIDTH.DELETE,
  HAS_IMAGE: COLUMNS_WIDTH.CONDITION,
};

export const VOICE_EVENTS = {
  PARTIAL_RESULTS: 'onSpeechPartialResults',
  RESULTS: 'onSpeechResults',
  START: 'onSpeechStart',
  END: 'onSpeechEnd',
  ERROR: 'onSpeechError',
};

const tempPlaceExamList = [
  {label: 'UOVO: LIC', value: 'UOVO: LIC'},
  {label: 'UOVO: 33 KH', value: 'UOVO: 33 KH'},
  {label: 'UOVO: 100 BP', value: 'UOVO: 100 BP'},
  {label: 'UOVO: 105 EVG', value: 'UOVO: 105 EVG'},
  {label: 'UOVO: WPB', value: 'UOVO: WPB'},
  {label: 'UOVO: WMI', value: 'UOVO: WMI'},
  {label: 'UOVO: LDD', value: 'UOVO: LDD'},
  {label: 'UOVO: SSF', value: 'UOVO: SSF'},
  {label: 'UOVO: LVM', value: 'UOVO: LVM'},
  {label: 'UOVO: DEN', value: 'UOVO: DEN'},
  {label: 'UOVO: DAL', value: 'UOVO: DAL'},
  {label: 'OFFSITE', value: 'OFFSITE'},
];

//Frame and Fixture list
export const FRAME_FIXTURE_LIST = [
  'Framed',
  'Unframed',
  'Hinged',
  'Glass',
  'Backed',
  'Museum Glass',
  'Matted',
  'Plexiglass',
  'Other',
];

//Hanging System list
export const HANGING_SYSTEM_LIST = [
  'Cleats',
  'D-rings',
  'Wire',
  'Z-clip',
  'Keyhole',
  'Security hooks',
  'Screw eyes',
  'Other',
];

export const CONDITION_STATES_LIST = [
  {name: 'Partial', id: 'true'},
  {name: 'Final', id: 'false'},
];

export const PHOTOS_REPORT_TYPES = {
  FRONT: 'front',
  BACK: 'back',
  SIDES: 'sides',
  DETAIL: 'detail',
};

export const GLOBAL_FONT_SIZE_MULTIPLIER_XS = 1.2
export const GLOBAL_FONT_SIZE_MULTIPLIER_SM = 1.4
export const GLOBAL_FONT_SIZE_MULTIPLIER_MD = 1.7