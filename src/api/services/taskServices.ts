import {
  API_DELETE_NOTE,
  API_DELETE_SIGNATURE,
  API_GET_BOL_COUNT,
  API_GET_HISTORY_REPORT_MATERIALS,
  API_GET_NOTES,
  API_GET_REPORT_MATERIALS,
  API_GET_REPORT_MATERIALS_INVENTORY,
  API_GET_SIGNATURES,
  API_GET_WO_ATTACHMENTS,
  API_REGISTER_ONE_REPORT_MATERIAL,
  API_REGISTER_REPORT_MATERIALS,
  API_SAVE_NOTE,
  API_SAVE_SIGNATURE,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {Paginated} from '@api/types/Response';
import {
  AttachmentType,
  BolCountType,
  HistoryReportMaterialType,
  IdReportMaterialType,
  NoteType,
  ReportMaterialType,
  SignatureType,
} from '@api/types/Task';

export type TaskBaseApiProps = {
  idJob: number;
};

export type SignaturesApiProps = {
  forceSend?: boolean;
} & TaskBaseApiProps;

const signatures = async ({
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
    signatureDatetime: new Date().toISOString().split(',')[0],
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
  id: number;
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

export type RegisterOneReportMaterialApiProps = {
  id?: number;
  idJob: number;
  idMaterial: number;
  quantity: number;
  idUser: number;
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
  console.log('response get wo attachments...');
  console.log(JSON.stringify(response));
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

export const taskServices = {
  signatures,
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
};
