import {
  API_GET_LOCATION_PLACES,
  API_GET_WO_STATUS,
  API_GET_WO_TYPES,
  API_CONTACT_US,
  API_GET_QR_USER,
  API_HELPDESK,
  SUCCESS_MESSAGES,
  API_GET_PACKING_DETAILS,
  API_GET_PLACES_CONDITION_REPORT,
  API_GET_ARTISTS,
  API_GET_ART_TYPES,
} from '@api/contants/endpoints';
import {getFetcher} from '@api/general/fetchers';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {GeneralListApi, Paginated} from '@api/types/Response';
import {cleanAddress} from '@utils/functions';
import {API_GOOGLE_MAPS} from '@env';

type PropsContactUs = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
  name: string;
  email: string;
};
const contactUs = async (props: PropsContactUs): Promise<boolean> => {
  const response = await postRequest(API_CONTACT_US, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

type PropsHelpDesk = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
};
const helpDesk = async (props: PropsHelpDesk): Promise<boolean> => {
  const response = await postRequest(API_HELPDESK, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

const getWoStatusList = async (): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(API_GET_WO_STATUS);
  return response.body?.data;
};

const getWoTypeList = async (): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(API_GET_WO_TYPES);
  return response.body?.data;
};

const getLocationPlaces = async (): Promise<GeneralListApi[]> => {
  const response = await getRequest<Paginated<GeneralListApi[]>>(
    API_GET_LOCATION_PLACES,
  );
  return response.body?.data;
};

const getLatLong = async (address: string) => {
  const response = await getFetcher(
    `https://maps.googleapis.com/maps/api/geocode/json?key=${API_GOOGLE_MAPS}&address=${encodeURIComponent(
      cleanAddress(address)!,
    )}`,
  );
  if (!response.data) {
    throw new Error('Error en la solicitud');
  }
  if (response.data.status !== 'OK') {
    throw new Error('No se encontraron coordenadas');
  }
  const location = response.data.results[0].geometry.location;
  return {
    latitude: location.lat,
    longitude: location.lng,
  };
};

export type EstimatedTimeByLocationProps = {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
};

const getEstimatedTimeByLocation = async ({
  fromLat,
  fromLng,
  toLat,
  toLng,
}: EstimatedTimeByLocationProps) => {
  try {
    const response = await getFetcher(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&key=${API_GOOGLE_MAPS}`,
    );
    const element = response?.data?.rows?.[0]?.elements?.[0];
    const duration = element?.duration;

    if (duration?.value) {
      const minutes = Math.round(duration.value / 60);
      return {
        value: minutes,
        text: duration.text,
      };
    }

    return {value: null, text: null};
  } catch (error) {
    console.error('Error getting estimated time:', error);
    return {value: null, text: null};
  }
};

const getQrUser = async (): Promise<string> => {
  const response = await getRequest<string>(API_GET_QR_USER);
  return response as unknown as string;
};

const getPackingDetails = async (): Promise<GeneralListApi[]> => {
  const response = await getRequest<Paginated<GeneralListApi[]>>(
    `${API_GET_PACKING_DETAILS}?query=`,
  );
  return response.body?.data;
};

const getPlacesConditionReport = async (): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(
    API_GET_PLACES_CONDITION_REPORT,
  );
  return response.body?.data ?? [];
};

const getArtists = async ({
  filter,
}: {
  filter: string;
}): Promise<GeneralListApi[]> => {
  const response = await getRequest<Paginated<GeneralListApi[]>>(
    `${API_GET_ARTISTS}?query=${filter}&start=0&limit=20`,
  );
  return response.body?.data ?? [];
};

const getArtTypes = async ({
  filter,
}: {
  filter: string;
}): Promise<GeneralListApi[]> => {
  const response = await getRequest<Paginated<GeneralListApi[]>>(
    `${API_GET_ART_TYPES}?query=${filter}&start=0&limit=20`,
  );
  return response.body?.data ?? [];
};

export const generalServices = {
  contactUs,
  helpDesk,
  getWoStatusList,
  getWoTypeList,
  getLocationPlaces,
  getLatLong,
  getEstimatedTimeByLocation,
  getQrUser,
  getPackingDetails,
  getPlacesConditionReport,
  getArtists,
  getArtTypes
};
