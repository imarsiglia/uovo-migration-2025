import {
  API_GET_CONDITION_CHECK_BY_INVENTORY,
  API_GET_CONDITION_REPORT_BY_INVENTORY,
  API_GET_RESUME_CONDITION_REPORT,
  API_GET_TOTAL_PHOTOS_CONDITION_CHECK,
  API_GET_TOTAL_PHOTOS_CONDITION_REPORT,
  API_SAVE_CONDITION_CHECK,
  API_SAVE_CONDITION_REPORT,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {
  ConditionReportType,
  JobInventoryType,
  ReportResumeType,
  TotalPhotoReportType,
} from '@api/types/Inventory';
import {Paginated} from '@api/types/Response';
import { TaskBaseApiProps } from './taskServices';

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

export const reportServices = {
  getResumeConditionReport,
  getResumeConditionCheck,
  getConditionReportbyInventory,
  saveConditionReport,
  getConditionCheckbyInventory,
  saveConditionCheck,
  getTotalPhotosConditionReport,
  getTotalPhotosConditionCheck,
};
