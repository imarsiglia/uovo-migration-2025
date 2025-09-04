import {getRequest} from '@api/helpers/apiClientHelper';
import {
  API_GET_EAST_COAST_DROPOFF,
  API_GET_EAST_COAST_PICKUP,
  API_GET_NS_LOCATION_PLACES,
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
import {GeneralListApi, Paginated} from '@api/types/Response';
import {getFormattedDate} from '@utils/functions';
import { NSItemListType, NSJobType } from '@api/types/Jobs';

export type NSRequestType = {
  date?: Date;
  location?: string | null;
  wo_number?: string;
  [key: string]: any;
};

const createGetRequest = <T>(baseUrl: string) => (params: NSRequestType) =>
  getRequest<T>(`${baseUrl}?${buildQuery(params)}`);

export const NSEndpoints = {
  getLocationPlaces: () =>
    getRequest<Paginated<GeneralListApi[]>>(API_GET_NS_LOCATION_PLACES),
  getEastCoastPickup: createGetRequest<Paginated<NSJobType[]>>(API_GET_EAST_COAST_PICKUP),
  getWestCoastPickup: createGetRequest<Paginated<NSJobType[]>>(API_GET_WEST_COAST_PICKUP),
  getWestCoastDropoff: createGetRequest<Paginated<NSJobType[]>>(API_GET_WEST_COAST_DROPOFF),
  getEastCoastDropoff: createGetRequest<Paginated<NSJobType[]>>(API_GET_EAST_COAST_DROPOFF),
  getInventoryEastCoastPickup: createGetRequest<Paginated<NSItemListType[]>>(
    API_GET_INVENTORY_EAST_COAST_PICKUP,
  ),
  getInventoryWestCoastPickup: createGetRequest<Paginated<NSItemListType[]>>(
    API_GET_INVENTORY_WEST_COAST_PICKUP,
  ),
  getInventoryWestCoastDropoff: createGetRequest<Paginated<NSItemListType[]>>(
    API_GET_INVENTORY_WEST_COAST_DROPOFF,
  ),
  getInventoryEastCoastDropoff: createGetRequest<Paginated<NSItemListType[]>>(
    API_GET_INVENTORY_EAST_COAST_DROPOFF,
  ),
  getUniqueRoutePickup: createGetRequest<Paginated<NSJobType[]>>(API_GET_UNIQUE_ROUTE_PICKUP),
  getUniqueRouteDropoff: createGetRequest<Paginated<NSJobType[]>>(API_GET_UNIQUE_ROUTE_DROPOFF),
  getInventoryUniqueRoutePickup: createGetRequest<Paginated<NSItemListType[]>>(
    API_GET_INVENTORY_UNIQUE_ROUTE_PICKUP,
  ),
  getInventoryUniqueRouteDropoff: createGetRequest<Paginated<NSItemListType[]>>(
    API_GET_INVENTORY_UNIQUE_ROUTE_DROPOFF,
  ),
};

const buildQuery = (params: NSRequestType = {}): string => {
  const query: Record<string, string> = {};

  if (params.date) {
    query.date = getFormattedDate(params.date, 'YYYY-MM-DD');
  }

  if (params.location && params.location != 'null') {
    query.location = params.location;
  }

  if (params.wo_number && params.wo_number.trim() !== '') {
    query.wo_number = params.wo_number.trim();
  }

  // Construye el query string
  return new URLSearchParams(query).toString();
};
