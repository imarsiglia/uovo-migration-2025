import {
  API_GET_EAST_COAST_DROPOFF,
  API_GET_EAST_COAST_PICKUP,
  API_GET_LOCATION_PLACES,
  API_GET_WEST_COAST_DROPOFF,
  API_GET_WEST_COAST_PICKUP,
  API_GET_INVENTORY_EAST_COAST_PICKUP,
  API_GET_INVENTORY_WEST_COAST_PICKUP,
  API_GET_INVENTORY_WEST_COAST_DROPOFF,
  API_GET_INVENTORY_EAST_COAST_DROPOFF,
  API_GET_UNIQUE_ROUTE_PICKUP,
  API_GET_UNIQUE_ROUTE_DROPOFF,
  API_GET_INVENTORY_UNIQUE_ROUTE_PICKUP,
  API_GET_INVENTORY_UNIQUE_ROUTE_DROPOFF,
} from '../contants/endpoints';
import {getFetcher} from '../general/fetchers';

export const NSEndpoints = {
  getLocationPlaces: () => getFetcher(API_GET_LOCATION_PLACES),
  getEastCoastPickup: (query: string) =>
    getFetcher(`${API_GET_EAST_COAST_PICKUP}?${query}`),
  getWestCoastPickup: (query: string) =>
    getFetcher(`${API_GET_WEST_COAST_PICKUP}?${query}`),
  getWestCoastDropoff: (query: string) =>
    getFetcher(`${API_GET_WEST_COAST_DROPOFF}?${query}`),
  getEastCoastDropoff: (query: string) =>
    getFetcher(`${API_GET_EAST_COAST_DROPOFF}?${query}`),
  getInventoryEastCoastPickup: (query: string) =>
    getFetcher(`${API_GET_INVENTORY_EAST_COAST_PICKUP}?${query}`),
  getInventoryWestCoastPickup: (query: string) =>
    getFetcher(`${API_GET_INVENTORY_WEST_COAST_PICKUP}?${query}`),
  getInventoryWestCoastDropoff: (query: string) =>
    getFetcher(`${API_GET_INVENTORY_WEST_COAST_DROPOFF}?${query}`),
  getInventoryEastCoastDropoff: (query: string) =>
    getFetcher(`${API_GET_INVENTORY_EAST_COAST_DROPOFF}?${query}`),
  getUniqueRoutePickup: (query: string) =>
    getFetcher(`${API_GET_UNIQUE_ROUTE_PICKUP}?${query}`),
  getUniqueRouteDropoff: (query: string) =>
    getFetcher(`${API_GET_UNIQUE_ROUTE_DROPOFF}?${query}`),
  getInventoryUniqueRoutePickup: (query: string) =>
    getFetcher(`${API_GET_INVENTORY_UNIQUE_ROUTE_PICKUP}?${query}`),
  getInventoryUniqueRouteDropoff: (query: string) =>
    getFetcher(`${API_GET_INVENTORY_UNIQUE_ROUTE_DROPOFF}?${query}`),
};
