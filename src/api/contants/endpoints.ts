
//AUTHENTICATION ENDPOINTS
export const API_LOGIN = '/login';
export const API_REFRESH_TOKEN = '/user/refreshtoken';
export const API_REGULAR_LOGIN = '/loginalter';

//help desk general
export const API_CONTACT_US = '/login/helpdesk';
export const API_HELPDESK = '/user/helpdesk';
export const API__GET_WO_STATUS = '/job/wostatus';
export const API__GET_WO_TYPES = '/job/wotypes';
export const API__GET_LOCATION_PLACES = '/job/load/locationplaces';

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


//NATIONAL SHUTTLE ENDPOINTS
export const API_GET_LOCATION_PLACES = '/jobns/load/locationplacesall'
export const API_GET_EAST_COAST_PICKUP = '/jobns/eastcoastpickup/query'
export const API_GET_WEST_COAST_PICKUP = '/jobns/westcoastpickup/query'
export const API_GET_WEST_COAST_DROPOFF = '/jobns/westcoastdropoff/query'
export const API_GET_EAST_COAST_DROPOFF = '/jobns/eastcoastdropoff/query'

export const API_GET_INVENTORY_EAST_COAST_PICKUP = '/jobns/inventory/eastcoastpickup/query'
export const API_GET_INVENTORY_WEST_COAST_PICKUP = '/jobns/inventory/westcoastpickup/query'
export const API_GET_INVENTORY_WEST_COAST_DROPOFF = '/jobns/inventory/westcoastdropoff/query'
export const API_GET_INVENTORY_EAST_COAST_DROPOFF = '/jobns/inventory/eastcoastdropoff/query'

//UNIQUE ROUTE
export const API_GET_UNIQUE_ROUTE_PICKUP = '/jobns/uniqueroutepickup/query'
export const API_GET_UNIQUE_ROUTE_DROPOFF = '/jobns/uniqueroutedropoff/query'

export const API_GET_INVENTORY_UNIQUE_ROUTE_PICKUP = '/jobns/inventory/uniqueroutepickup/query'
export const API_GET_INVENTORY_UNIQUE_ROUTE_DROPOFF = '/jobns/inventory/uniqueroutedropoff/query'


export const SUCCESS_MESSAGES = {
  OPERACION_EXITOSA : "Operación exitosa",
  SUCCESS: "SUCCESS"
}

