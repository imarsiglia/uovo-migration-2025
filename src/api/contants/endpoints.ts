//AUTHENTICATION ENDPOINTS
export const API_LOGIN = '/login';
export const API_REFRESH_TOKEN = '/user/refreshtoken';
export const API_REGULAR_LOGIN = '/loginalter';

// user update profile
export const API_UPDATE_USER = '/user/update'

//help desk general
export const API_CONTACT_US = '/login/helpdesk';
export const API_HELPDESK = '/user/helpdesk';
export const API_GET_WO_STATUS = '/job/wostatus';
export const API_GET_WO_TYPES = '/job/wotypes';
export const API_GET_LOCATION_PLACES = '/job/load/locationplaces';

//jobs
export const API_CALENDAR_TIMELINE = '/job/calendar';
export const API_TIMELINE = '/job/query';
export const API_JOBQUEUE = '/job/queryQueue';

//topsheet
export const API_TOPSHEET = '/job/topsheet';
export const API_LOCATION_LETSGO = '/job/letsgo';

// topsheet Location Tab
export const API_LOCATION_REPORT_ISSUE = '/job/problem';
export const API_GET_LOCATION_NOTES = '/notes/location/loadContactComments';
export const API_SAVE_LOCATION_NOTES = '/notes/location/saveContactComments';

// topsheet task
export const API_SEND_EMAIL_BOL = '/bol/sendEmail';
export const API_TASK_COUNT = '/job/task/count';

// member team
export const API_REMOVE_TEAM_MEMBER = '/job/team/remove';

//signatures
export const API_GET_SIGNATURES = '/signature/query';
export const API_SAVE_SIGNATURE = '/signature/register';
export const API_DELETE_SIGNATURE = '/signature/remove/';

// notes
export const API_GET_NOTES = '/notes/query';
export const API_SAVE_NOTE = '/notes/register';
export const API_DELETE_NOTE = '/notes/remove';

// report materials
export const API_GET_REPORT_MATERIALS = '/material/register/query';
export const API_REGISTER_REPORT_MATERIALS = '/material/register';
export const API_GET_HISTORY_REPORT_MATERIALS = '/material/history';
export const API_GET_REPORT_MATERIALS_INVENTORY = '/material/query';
export const API_REGISTER_ONE_REPORT_MATERIAL = '/material/register/one';

// attachments
export const API_GET_WO_ATTACHMENTS = '/job/files';

// editbol
export const API_GET_BOL_COUNT = '/job/bolparams';

// labor report
export const API_GET_LABOR_REPORTS = '/clockin/status/manually';
export const API_REGISTER_LABOR_REPORT = '/clockin/register';
export const API_GET_EMPLOYEES = '/user/load/employee';
export const API_GET_LABOR_CODES = '/clockin/laborcodes';

// clock in /clock out
export const API_CLOCK_IN_START = '/clockin/start';
export const API_CLOCK_IN_PAUSE = '/clockin/pause';
export const API_CLOCK_IN_STOP = '/clockin/stop';
export const API_CLOCK_RESUME = '/clockin/resume';

// digital ID
export const API_GET_QR_USER = '/user/qr';

//inventory
export const API_GET_JOB_INVENTORY = '/job/inventory';
export const API_UPDATE_INVENTORY_STATUS = '/inventory/status/update';
export const API_UPDATE_ALL_INVENTORY_STATUS = '/inventory/status/update/all';
export const API_PREPARE_INVENTORY = 'job/prepped';
export const API_DELETE_INVENTORY_ITEM = '/inventory/netsuite/remove';
// add inventory
export const API_SEARCH_FULL_INVENTORY = '/inventory/netsuite/search';
export const API_SEARCH_INVENTORY_ITEM =
  '/inventory/netsuite/search/autocomplete';
export const API_ADD_INVENTORY_ITEM = '/inventory/netsuite/add';

// item detail inventory
export const API_GET_INVENTORY_ITEM_DETAIL = '/job/inventory/individual';
export const API_UPDATE_INVENTORY_ITEM_DETAIL = '/inventory/detail/update';

//NATIONAL SHUTTLE ENDPOINTS
export const API_GET_NS_LOCATION_PLACES = '/jobns/load/locationplacesall';
export const API_GET_EAST_COAST_PICKUP = '/jobns/eastcoastpickup/query';
export const API_GET_WEST_COAST_PICKUP = '/jobns/westcoastpickup/query';
export const API_GET_WEST_COAST_DROPOFF = '/jobns/westcoastdropoff/query';
export const API_GET_EAST_COAST_DROPOFF = '/jobns/eastcoastdropoff/query';

// CONDITION REPORT / CHECK
export const API_GET_RESUME_CONDITION_REPORT = '/conditionreport/resume';
export const API_GET_RESUME_CONDITION_CHECK = '/conditioncheck/resume';

export const API_SAVE_CONDITION_REPORT = '/conditionreport/register';
export const API_SAVE_CONDITION_CHECK = '/conditioncheck/register';

export const API_GET_CONDITION_REPORT_BY_INVENTORY = '/conditionreport/list';
export const API_GET_CONDITION_CHECK_BY_INVENTORY = '/conditioncheck/list';

export const API_GET_TOTAL_PHOTOS_CONDITION_REPORT = '/conditionreport/totalPhotos';
export const API_GET_TOTAL_PHOTOS_CONDITION_CHECK = '/conditioncheck/totalPhotos';

// GENERAL
export const API_GET_PACKING_DETAILS = '/conditionreport/load/packingdetail';
export const API_GET_PLACES_CONDITION_REPORT = '/conditionreport/load/places';
export const API_GET_ARTISTS = '/conditionreport/load/artist';
export const API_GET_ART_TYPES = '/conditionreport/load/arttype';

export const API_GET_INVENTORY_EAST_COAST_PICKUP =
  '/jobns/inventory/eastcoastpickup/query';
export const API_GET_INVENTORY_WEST_COAST_PICKUP =
  '/jobns/inventory/westcoastpickup/query';
export const API_GET_INVENTORY_WEST_COAST_DROPOFF =
  '/jobns/inventory/westcoastdropoff/query';
export const API_GET_INVENTORY_EAST_COAST_DROPOFF =
  '/jobns/inventory/eastcoastdropoff/query';

//UNIQUE ROUTE
export const API_GET_UNIQUE_ROUTE_PICKUP = '/jobns/uniqueroutepickup/query';
export const API_GET_UNIQUE_ROUTE_DROPOFF = '/jobns/uniqueroutedropoff/query';

export const API_GET_INVENTORY_UNIQUE_ROUTE_PICKUP =
  '/jobns/inventory/uniqueroutepickup/query';
export const API_GET_INVENTORY_UNIQUE_ROUTE_DROPOFF =
  '/jobns/inventory/uniqueroutedropoff/query';

export const SUCCESS_MESSAGES = {
  OPERACION_EXITOSA: 'Operación exitosa',
  SUCCESS: 'SUCCESS',
};
