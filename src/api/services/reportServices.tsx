import {
  API_GET_CONDITION_CHECK_BY_INVENTORY,
  API_GET_CONDITION_REPORT_BY_INVENTORY,
  API_GET_PHOTO_CONDITION_DETAIL,
  API_GET_PHOTO_CONDITION_OVERVIEW,
  API_GET_PHOTOS_CONDITION,
  API_GET_RESUME_CONDITION_REPORT,
  API_GET_TOTAL_PHOTOS_CONDITION_CHECK,
  API_GET_TOTAL_PHOTOS_CONDITION_REPORT,
  API_SAVE_CONDITION_CHECK,
  API_SAVE_CONDITION_REPORT,
  API_SAVE_PHOTO_CONDITION,
  API_SAVE_ZOOM_SCREEN,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {
  getRequest,
  getRequestCustomType,
  postRequest,
} from '@api/helpers/apiClientHelper';
import {
  ConditionReportType,
  JobInventoryType,
  ReportResumeType,
  TotalPhotoReportType,
} from '@api/types/Inventory';
import {Paginated} from '@api/types/Response';
import {TaskBaseApiProps} from './taskServices';
import {
  ConditionPhotoSideType,
  ConditionPhotoType,
  ConditionType,
  OverviewReportType,
  PhotoDetailType,
  PhotoOverviewType,
} from '@api/types/Condition';

const getResumeConditionReport = async ({
  idJob,
}: TaskBaseApiProps): Promise<Paginated<ReportResumeType[]>> => {
  const response = await getRequest<Paginated<ReportResumeType[]>>(
    `${API_GET_RESUME_CONDITION_REPORT}?idJob=${idJob}`,
  );
  return response.body;
};

const getResumeConditionCheck = async ({
  idJob,
}: TaskBaseApiProps): Promise<Paginated<ReportResumeType[]>> => {
  const response = await getRequest<Paginated<ReportResumeType[]>>(
    `${API_GET_RESUME_CONDITION_REPORT}?idJob=${idJob}`,
  );
  return response.body;
};

const getConditionReportbyInventory = async ({
  idJobInventory,
}: {
  idJobInventory: number;
}): Promise<
  Paginated<ConditionReportType[]> & {obj_data: JobInventoryType}
> => {
  const response = await getRequest<
    Paginated<ConditionReportType[]> & {obj_data: JobInventoryType}
  >(
    `${API_GET_CONDITION_REPORT_BY_INVENTORY}?idJobInventory=${idJobInventory}`,
  );
  return response.body;
};

const getConditionCheckbyInventory = async ({
  idJobInventory,
}: {
  idJobInventory: number;
}): Promise<
  Paginated<ConditionReportType[]> & {obj_data: JobInventoryType}
> => {
  const response = await getRequest<
    Paginated<ConditionReportType[]> & {obj_data: JobInventoryType}
  >(`${API_GET_CONDITION_CHECK_BY_INVENTORY}?idJobInventory=${idJobInventory}`);
  return response.body;
};

export type SaveConditionReportApiProps = {
  id: number | null;
  idJob: number;
  partial: boolean;
  idInventory: number;

  packed_height?: string | null;
  packed_length?: string | null;
  packed_width?: string | null;
  un_packed_height?: string | null;
  un_packed_length?: string | null;
  un_packed_width?: string | null;
  frame_height?: string | null;
  frame_length?: string | null;
  frame_width?: string | null;
  weight?: string | null;
  unpacked_weight?: string | null;

  artistName?: string | null;
  artTypeName?: string | null;

  mediumName?: string | null;
  year?: string | null;
  edition?: string | null;
  signature?: string | null;
  labeled?: string | null;
  title?: string | null;
  placeOfExam?: string | null;
  conditionArtWork?: string | null;
  otherText?: string | null;

  frameFixture?: string[] | null;
  hangingSystem?: string[] | null;
  packingDetail?: string[] | null;
};

const saveConditionReport = async (
  props: SaveConditionReportApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_SAVE_CONDITION_REPORT, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export type SaveConditionCheckApiProps = {
  id: number | null;
  idJob: number;
  idInventory: number;

  packed_height?: string | null;
  packed_length?: string | null;
  packed_width?: string | null;
  un_packed_height?: string | null;
  un_packed_length?: string | null;
  un_packed_width?: string | null;

  artistName?: string | null;
  artTypeName?: string | null;

  mediumName?: string | null;
  year?: string | null;
  edition?: string | null;
  signature?: string | null;
  labeled?: string | null;
  title?: string | null;
  placeOfExam?: string | null;
  overalConditionArtwork?: string | null;
};

const saveConditionCheck = async (
  props: SaveConditionCheckApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_SAVE_CONDITION_CHECK, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const getTotalPhotosConditionReport = async ({
  id,
}: {
  id: number;
}): Promise<TotalPhotoReportType[]> => {
  const response = await getRequest<TotalPhotoReportType[]>(
    `${API_GET_TOTAL_PHOTOS_CONDITION_REPORT}?id=${id}`,
  );
  return response.body;
};

const getTotalPhotosConditionCheck = async ({
  id,
}: {
  id: number;
}): Promise<TotalPhotoReportType[]> => {
  const response = await getRequest<TotalPhotoReportType[]>(
    `${API_GET_TOTAL_PHOTOS_CONDITION_CHECK}?id=${id}`,
  );
  return response.body;
};

export type GetPhotosConditionApiProps = {
  conditionType: ConditionType;
  sideType: ConditionPhotoSideType;
  reportId: number;
};
const getPhotosCondition = async ({
  conditionType,
  sideType,
  reportId,
}: GetPhotosConditionApiProps): Promise<ConditionPhotoType[]> => {
  const response = await getRequest<Paginated<ConditionPhotoType[]>>(
    `/${conditionType}${API_GET_PHOTOS_CONDITION}?reportType=${sideType}&reportId=${reportId}`,
  );
  return response.body?.data ?? [];
};

type RemovePhotoConditionApiProps = {
  conditionType: ConditionType;
  isOverview: boolean;
  id: number;
};
const removePhotoCondition = async ({
  conditionType,
  isOverview = false,
  id,
}: RemovePhotoConditionApiProps): Promise<boolean> => {
  const response = await postRequest(
    `/${conditionType}/${
      isOverview ? 'deleteImageOverview' : 'deleteImageDetail'
    }/${id}`,
  );
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

type SavePhotoConditionApiProps = {
  conditionType: ConditionType;
  idJob: number;
  reportId: number;
  idJobInventory: number;
  type: ConditionPhotoSideType;
  title?: string;
  description?: string | null;
  id?: number | null;
  photo: string;
  idStickyNote?: number | null;
  subType?: string | null;
};
const savePhotoCondition = async ({
  conditionType,
  ...props
}: SavePhotoConditionApiProps): Promise<boolean> => {
  const response = await postRequest(
    `/${conditionType}${API_SAVE_PHOTO_CONDITION}`,
    props,
  );
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export type PhotoConditionOverviewApiProps = {
  conditionType: ConditionType;
  id?: number;
};
const getPhotoConditionOverview = async ({
  conditionType,
  id,
}: PhotoConditionOverviewApiProps): Promise<OverviewReportType> => {
  const response = await getRequestCustomType<OverviewReportType>(
    `/${conditionType}${API_GET_PHOTO_CONDITION_OVERVIEW}?id=${id}`,
  );
  return response;
};

export type PhotoConditionDetailApiProps = {
  conditionType: ConditionType;
  id?: number;
};
const getPhotoConditionDetail = async ({
  conditionType,
  id,
}: PhotoConditionDetailApiProps): Promise<PhotoDetailType> => {
  const response = await getRequest<PhotoDetailType>(
    `/${conditionType}${API_GET_PHOTO_CONDITION_DETAIL}?id=${id}`,
  );
  return response.body;
};

type SaveZoomScreenProps = {
  conditionType: ConditionType;
  idJob: number;
  reportId?: number;
  idJobInventory: number;
  data: any;
  idImg?: number;
  reportType?: string;
  reportSubType?: string;
};
const saveZoomScreen = async ({
  conditionType,
  ...props
}: SaveZoomScreenProps): Promise<ZoomScreenResponse> => {
  const response = await postRequest<ZoomScreenResponse>(
    `/${conditionType}${API_SAVE_ZOOM_SCREEN}`,
    props,
  );
  return response.body;
};

type ZoomScreenResponse = {
  reportId: number;
  reportType: ConditionPhotoSideType;
  idJob: number;
  idImg: number;
  idJobInventory: number;
};

export const reportServices = {
  getResumeConditionReport,
  getResumeConditionCheck,
  getConditionReportbyInventory,
  saveConditionReport,
  getConditionCheckbyInventory,
  saveConditionCheck,
  getTotalPhotosConditionReport,
  getTotalPhotosConditionCheck,
  getPhotosCondition,
  removePhotoCondition,
  savePhotoCondition,
  getPhotoConditionOverview,
  getPhotoConditionDetail,
  saveZoomScreen,
};
