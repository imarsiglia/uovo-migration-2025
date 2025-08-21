import { API, API_CONTEXT } from '@env';


//AUTHENTICATION ENDPOINTS
export const API_LOGIN = `/login`;
export const API_REFRESH_TOKEN = `/user/refreshtoken`;

//help desk general
export const API_HELPDESK = `/login/helpdesk`;

//NATIONAL SHUTTLE ENDPOINTS
export const API_GET_LOCATION_PLACES = `${API}${API_CONTEXT}/jobns/load/locationplacesall`
export const API_GET_EAST_COAST_PICKUP = `${API}${API_CONTEXT}/jobns/eastcoastpickup/query`
export const API_GET_WEST_COAST_PICKUP = `${API}${API_CONTEXT}/jobns/westcoastpickup/query`
export const API_GET_WEST_COAST_DROPOFF = `${API}${API_CONTEXT}/jobns/westcoastdropoff/query`
export const API_GET_EAST_COAST_DROPOFF = `${API}${API_CONTEXT}/jobns/eastcoastdropoff/query`

export const API_GET_INVENTORY_EAST_COAST_PICKUP = `${API}${API_CONTEXT}/jobns/inventory/eastcoastpickup/query`
export const API_GET_INVENTORY_WEST_COAST_PICKUP = `${API}${API_CONTEXT}/jobns/inventory/westcoastpickup/query`
export const API_GET_INVENTORY_WEST_COAST_DROPOFF = `${API}${API_CONTEXT}/jobns/inventory/westcoastdropoff/query`
export const API_GET_INVENTORY_EAST_COAST_DROPOFF = `${API}${API_CONTEXT}/jobns/inventory/eastcoastdropoff/query`

//UNIQUE ROUTE
export const API_GET_UNIQUE_ROUTE_PICKUP = `${API}${API_CONTEXT}/jobns/uniqueroutepickup/query`
export const API_GET_UNIQUE_ROUTE_DROPOFF = `${API}${API_CONTEXT}/jobns/uniqueroutedropoff/query`

export const API_GET_INVENTORY_UNIQUE_ROUTE_PICKUP = `${API}${API_CONTEXT}/jobns/inventory/uniqueroutepickup/query`
export const API_GET_INVENTORY_UNIQUE_ROUTE_DROPOFF = `${API}${API_CONTEXT}/jobns/inventory/uniqueroutedropoff/query`


export const SUCCESS_MESSAGES = {
  OPERACION_EXITOSA : "Operación exitosa",
  SUCCESS: "SUCCESS"
}