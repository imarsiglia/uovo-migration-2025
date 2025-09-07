import {
    API_DELETE_NOTE,
  API_GET_NOTES,
  API_GET_SIGNATURES,
  API_SAVE_NOTE,
  API_SAVE_SIGNATURE,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {Paginated} from '@api/types/Response';
import {NoteType, SignatureType} from '@api/types/Task';

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

export const taskServices = {
  signatures,
  saveSignature,
  getNotes,
  saveNote,
  deleteNote
};
