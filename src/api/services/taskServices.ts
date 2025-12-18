import {
  API_DELETE_IMAGE,
  API_DELETE_NOTE,
  API_DELETE_SIGNATURE,
  API_GET_BOL_COUNT,
  API_GET_EMPLOYEES,
  API_GET_FULL_IMAGE,
  API_GET_HISTORY_REPORT_MATERIALS,
  API_GET_IMAGES,
  API_GET_LABOR_CODES,
  API_GET_LABOR_REPORTS,
  API_GET_NOTES,
  API_GET_REPORT_MATERIALS,
  API_GET_REPORT_MATERIALS_INVENTORY,
  API_GET_SIGNATURES,
  API_GET_WO_ATTACHMENTS,
  API_REGISTER_IMAGES,
  API_REGISTER_LABOR_REPORT,
  API_REGISTER_ONE_REPORT_MATERIAL,
  API_REGISTER_REPORT_MATERIALS,
  API_SAVE_NOTE,
  API_SAVE_SIGNATURE,
  API_UPDATE_IMAGES,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {LaborCodeType} from '@api/types/Jobs';
import {Paginated} from '@api/types/Response';
import {
  AttachmentType,
  BolCountType,
  EmployeeType,
  HistoryReportMaterialType,
  IdReportMaterialType,
  LaborReportType,
  NoteType,
  ReportMaterialType,
  SignatureType,
  TaskImageType,
} from '@api/types/Task';
import {BooleanNumberType} from '@generalTypes/general';

export type TaskBaseApiProps = {
  idJob: number;
};

export type SignaturesApiProps = {
  forceSend?: boolean;
} & TaskBaseApiProps;

const getSignatures = async ({
  idJob,
  forceSend = false,
}: SignaturesApiProps): Promise<SignatureType[]> => {
  const response = await getRequest<Paginated<SignatureType[]>>(
    `${API_GET_SIGNATURES}?idJob=${idJob}&force_send=${forceSend}`,
  );
  return response.body?.data ?? [];
};

export type SaveSignatureApiProps = {
  printName: string;
  type: string;
  signature: string;
  force_send: boolean;
} & TaskBaseApiProps;
const saveSignature = async (
  props: SaveSignatureApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_SAVE_SIGNATURE, {
    id: null,
    signatureDatetime: new Date().toISOString().split('.')[0],
    ...props,
  });
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const deleteSignature = async ({id}: {id: number}): Promise<boolean> => {
  const response = await postRequest(`${API_DELETE_SIGNATURE}/${id}`);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const getNotes = async ({idJob}: TaskBaseApiProps): Promise<NoteType[]> => {
  const response = await getRequest<Paginated<NoteType[]>>(
    `${API_GET_NOTES}?idJob=${idJob}`,
  );
  return response.body?.data ?? [];
};

export type SaveNoteApiProps = {
  id?: number | null;
  title: string;
  description: string;
} & TaskBaseApiProps;
const saveNote = async (props: SaveNoteApiProps): Promise<boolean> => {
  const response = await postRequest(API_SAVE_NOTE, {
    ...props,
    update_time: new Date().toISOString().split(',')[0],
  });
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const deleteNote = async ({id}: {id: number}): Promise<boolean> => {
  const response = await postRequest(`${API_DELETE_NOTE}/${id}`);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const getReportMaterials = async ({
  idJob,
}: TaskBaseApiProps): Promise<ReportMaterialType[]> => {
  const response = await getRequest<Paginated<ReportMaterialType[]>>(
    `${API_GET_REPORT_MATERIALS}?idJob=${idJob}`,
  );
  return response.body?.data ?? [];
};

export type RegisterReportMaterialsApiProps = {
  list: ReportMaterialType[];
} & TaskBaseApiProps;

const registerReportMaterials = async (
  props: RegisterReportMaterialsApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_REGISTER_REPORT_MATERIALS, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export type HistoryReportMaterialsApiProps = {
  idJob: number;
  id: number;
};
const getHistoryReportMaterials = async ({
  idJob,
  id,
}: HistoryReportMaterialsApiProps): Promise<HistoryReportMaterialType[]> => {
  const response = await getRequest<Paginated<HistoryReportMaterialType[]>>(
    `${API_GET_HISTORY_REPORT_MATERIALS}?idJob=${idJob}&idMaterial=${id}`,
  );
  return response.body?.data ?? [];
};

export type ReportMaterialsInventoryApiProps = {
  idJob: number;
  filter: string;
};
const getReportMaterialsInventory = async ({
  idJob,
  filter,
}: ReportMaterialsInventoryApiProps): Promise<IdReportMaterialType[]> => {
  const response = await getRequest<Paginated<IdReportMaterialType[]>>(
    `${API_GET_REPORT_MATERIALS_INVENTORY}?downloadAll=0&idJob=${idJob}&filter=${filter}`,
  );
  return response.body?.data ?? [];
};

export type ReportMaterialsInventoryAllProps = {
  idJob: number;
};
const getReportMaterialsInventoryAll = async ({
  idJob,
}: ReportMaterialsInventoryAllProps): Promise<IdReportMaterialType[]> => {
  const response = await getRequest<Paginated<IdReportMaterialType[]>>(
    `${API_GET_REPORT_MATERIALS_INVENTORY}?downloadAll=1&idJob=${idJob}`,
  );
  return response.body?.data ?? [];
};

export type RegisterOneReportMaterialApiProps = {
  id?: number;
  idJob: number;
  idMaterial: number;
  quantity: number;
  idUser: number | null;
};

const registerOneReportMaterial = async (
  props: RegisterOneReportMaterialApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_REGISTER_ONE_REPORT_MATERIAL, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const getWoAttachments = async ({
  idJob,
}: TaskBaseApiProps): Promise<AttachmentType[]> => {
  const response = await getRequest<Paginated<AttachmentType[]>>(
    `${API_GET_WO_ATTACHMENTS}?idJob=${idJob}`,
  );
  return response.body?.data ?? [];
};

const getBOLCount = async ({
  idJob,
}: TaskBaseApiProps): Promise<BolCountType> => {
  const response = await getRequest<BolCountType>(
    `${API_GET_BOL_COUNT}?idJob=${idJob}`,
  );
  return response.body;
};

export type SaveBOLCountApiProps = {
  pbs: string;
  packageCount: number;
} & TaskBaseApiProps;
const saveBOLCount = async (props: SaveBOLCountApiProps): Promise<boolean> => {
  const response = await postRequest(API_GET_BOL_COUNT, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export type LaborReportsApiProps = {
  toClockout: BooleanNumberType;
} & TaskBaseApiProps;
const getLaborReports = async ({
  idJob,
  toClockout,
}: LaborReportsApiProps): Promise<LaborReportType[]> => {
  const response = await getRequest<Paginated<LaborReportType[]>>(
    `${API_GET_LABOR_REPORTS}?idjob=${idJob}&toclockout=${toClockout}`,
  );
  return response.body?.data ?? [];
};

export type DeleteLaborReportApiProps = {
  idJob: number;
  confirm: BooleanNumberType;
  list: LaborReportType[];
  queue: BooleanNumberType;
  preventEditCurrentClock: boolean;
};

const registerLaborReport = async (
  props: DeleteLaborReportApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_REGISTER_LABOR_REPORT, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export type EmployeesApiProps = {
  filter: string;
};

const getEmployees = async ({
  filter,
}: EmployeesApiProps): Promise<EmployeeType[]> => {
  const response = await getRequest<Paginated<EmployeeType[]>>(
    `${API_GET_EMPLOYEES}?query=${filter}`,
  );
  return response.body?.data ?? [];
};

const getLaborCodes = async (): Promise<LaborCodeType[]> => {
  const response = await getRequest<Paginated<LaborCodeType[]>>(
    API_GET_LABOR_CODES,
  );
  return response.body?.data ?? [];
};

const getImages = async ({
  idJob,
}: TaskBaseApiProps): Promise<TaskImageType[]> => {
  const response = await getRequest<Paginated<TaskImageType[]>>(
    `${API_GET_IMAGES}?idJob=${idJob}`,
  );
  return response.body?.data ?? [];
};

export type SaveImageApiProps = {
  title: string;
  description: string | null | undefined;
  photos: string[];
} & TaskBaseApiProps;
const registerImage = async (props: SaveImageApiProps): Promise<boolean> => {
  console.log("register image")
  console.log(props)
  const response = await postRequest(API_REGISTER_IMAGES, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

export type UpdateImageApiProps = {
  title: string;
  description: string;
  photos: {id: string; photo: string}[];
} & TaskBaseApiProps;
const updateImage = async (props: UpdateImageApiProps): Promise<boolean> => {
  console.log("update image service")
  console.log(props)
  const response = await postRequest(API_UPDATE_IMAGES, props);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const deleteImage = async ({id}: {id: number}): Promise<boolean> => {
  const response = await postRequest(`${API_DELETE_IMAGE}/${id}`);
  return response.message === SUCCESS_MESSAGES.SUCCESS;
};

const getFullImage = async ({id}: {id: number}): Promise<string> => {
  const response = await getRequest<string>(`${API_GET_FULL_IMAGE}?id=${id}`);
  return response.body ?? '';
};

export const taskServices = {
  getSignatures,
  saveSignature,
  deleteSignature,
  getNotes,
  saveNote,
  deleteNote,
  getReportMaterials,
  registerReportMaterials,
  getHistoryReportMaterials,
  getReportMaterialsInventory,
  registerOneReportMaterial,
  getWoAttachments,
  getBOLCount,
  saveBOLCount,
  getLaborReports,
  registerLaborReport,
  getEmployees,
  getLaborCodes,
  getReportMaterialsInventoryAll,
  getImages,
  deleteImage,
  getFullImage,
  registerImage,
  updateImage,
};
