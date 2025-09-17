import {
  API_GET_CONDITION_REPORT_BY_INVENTORY,
  API_GET_RESUME_CONDITION_REPORT,
  API_SAVE_CONDITION_REPORT,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {
  ConditionReportType,
  JobInventoryType,
  ReportResumeType,
} from '@api/types/Inventory';
import {Paginated} from '@api/types/Response';

export type TaskBaseApiProps = {
  idJob: number;
};

export type SignaturesApiProps = {
  forceSend?: boolean;
} & TaskBaseApiProps;

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

export type SaveConditionReportApiProps = {
  id: string | null;
  idJob: number;
  partial: boolean;
  idInventory: string;

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
): Promise<Paginated<ReportResumeType[]>> => {
  const response = await postRequest<Paginated<ReportResumeType[]>>(
    API_SAVE_CONDITION_REPORT,
    props,
  );
  return response.body;
};

export const reportServices = {
  getResumeConditionReport,
  getResumeConditionCheck,
  saveConditionReport,
  getConditionReportbyInventory,
};
