import {
  API_CALENDAR_TIMELINE,
  API_CLOCK_IN_PAUSE,
  API_CLOCK_IN_START,
  API_CLOCK_IN_STOP,
  API_CLOCK_RESUME,
  API_GET_LOCATION_NOTES,
  API_GET_VISUALIZE_BOL,
  API_JOBQUEUE,
  API_LOCATION_LETSGO,
  API_LOCATION_REPORT_ISSUE,
  API_REMOVE_TEAM_MEMBER,
  API_SAVE_LOCATION_NOTES,
  API_SEND_EMAIL_BOL,
  API_TASK_COUNT,
  API_TIMELINE,
  API_TOPSHEET,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {
  getRequest,
  getRequestString,
  postRequest,
} from '@api/helpers/apiClientHelper';
import {JobDetailType, JobType, TaskJobType} from '@api/types/Jobs';
import {Paginated} from '@api/types/Response';
import {BooleanNumberType} from '@generalTypes/general';
import {TaskBaseApiProps} from './taskServices';

const calendar = async (month: number, year: number): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(
    `${API_CALENDAR_TIMELINE}?month=${month}&year=${year}`,
  );
  return response.body?.data ?? [];
};

const timeline = async (date: string): Promise<JobType[]> => {
  const response = await getRequest<Paginated<JobType[]>>(
    `${API_TIMELINE}?date=${date}&start=0&limit=100&totalize=1`,
  );
  return response.body?.data ?? [];
};

export type JobQueueApiProps = {
  orderBy: string;
  filter?: string;
  place?: string[];
  totalize?: number;
  start?: number;
  limit?: number;
};

const jobqueue = async (props: JobQueueApiProps): Promise<JobType[]> => {
  const response = await postRequest<Paginated<JobType[]>>(API_JOBQUEUE, props);
  return response.body?.data ?? [];
};

export type TopSheetApiProps = {
  id: string;
  queue: BooleanNumberType;
};
const topsheet = async ({
  id,
  queue,
}: TopSheetApiProps): Promise<JobDetailType> => {
  const response = await getRequest<JobDetailType>(
    `${API_TOPSHEET}?idjob=${id}&queue=${queue}`,
  );
  return response.body;
};

export type LetsGoApiProps = {
  idJob: number;
  estimate: number;
  type: string;
  force_send: boolean;
};
const letsGo = async ({
  idJob,
  estimate,
  type,
  force_send = false,
}: LetsGoApiProps): Promise<unknown> => {
  const response = await postRequest(`${API_LOCATION_LETSGO}/${idJob}`, {
    estimate,
    type,
    force_send,
  });
  return response;
};

type ReportIssueProps = {
  idJob: number;
  idProblemType: string;
  description?: string | null;
  attachment?: string | null;
  destination?: string;
};

const reportIssueLocation = async (
  props: ReportIssueProps,
): Promise<boolean> => {
  const response = await postRequest(API_LOCATION_REPORT_ISSUE, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type LocationNotesApiProps = {
  idJob: number;
  type: string;
};
const locationNotes = async ({
  idJob,
  type,
}: LocationNotesApiProps): Promise<string> => {
  const response = await getRequest<string>(
    `${API_GET_LOCATION_NOTES}?idJob=${idJob}&type=${type.toUpperCase()}`,
  );
  return response.body;
};

export type SaveLocationNoteApiProps = {
  idJob: number;
  type: string;
  value: string;
};

const saveLocationNotes = async ({
  idJob,
  value,
  type,
}: SaveLocationNoteApiProps): Promise<boolean> => {
  const response = await postRequest(API_SAVE_LOCATION_NOTES, {
    idJob,
    value,
    type: type.toUpperCase(),
  });
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type SendEmailBOLProps = {
  idJob: number;
  destination: string[];
  force_send?: boolean;
  force_send_signature_count?: boolean;
};

const sendEmailBOL = async ({
  idJob,
  destination,
  force_send = false,
  force_send_signature_count = false,
}: SendEmailBOLProps): Promise<any> => {
  const response = await postRequest(API_SEND_EMAIL_BOL, {
    idJob,
    destination,
    force_send,
    force_send_signature_count,
  });
  return response;
};

export type TaskCountApiProps = {
  idJob: number;
};
const getTaskCount = async ({
  idJob,
}: TaskCountApiProps): Promise<TaskJobType[]> => {
  const response = await getRequest<TaskJobType[]>(
    `${API_TASK_COUNT}?idjob=${idJob}`,
  );
  return response.body;
};

export type ClockInApiProps = {
  laborCode: string;
  queue: BooleanNumberType;
} & TaskBaseApiProps;
const clockIn = async (props: ClockInApiProps): Promise<boolean> => {
  const response = await postRequest(API_CLOCK_IN_START, {
    ...props,
    start: new Date().toISOString().split('.')[0],
  });
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type PauseJobApiProps = {
  queue: BooleanNumberType;
} & TaskBaseApiProps;
const pauseJob = async (props: PauseJobApiProps): Promise<boolean> => {
  const response = await postRequest(API_CLOCK_IN_PAUSE, {
    ...props,
    pause: new Date().toISOString().split('.')[0],
  });
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

const clockout = async (props: PauseJobApiProps): Promise<boolean> => {
  const response = await postRequest(API_CLOCK_IN_STOP, {
    ...props,
    stop: new Date().toISOString().split('.')[0],
  });
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

const resumeJob = async (props: PauseJobApiProps): Promise<boolean> => {
  const response = await postRequest(API_CLOCK_RESUME, {
    ...props,
    resume: new Date().toISOString().split('.')[0],
  });
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export type RemoveMemberTeamApiProps = {
  idUser: number;
  jobQueue: BooleanNumberType;
} & TaskBaseApiProps;
const removeMemberTeam = async (
  props: RemoveMemberTeamApiProps,
): Promise<boolean> => {
  const response = await postRequest(API_REMOVE_TEAM_MEMBER, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

const getBolPdf = async ({idJob}: TaskBaseApiProps): Promise<string | null> => {
  const response = await getRequestString<string>(
    `${API_GET_VISUALIZE_BOL}/${idJob}?create=0`,
  );
  return response.body;
};

export const jobServices = {
  calendar,
  timeline,
  jobqueue,
  topsheet,
  letsGo,
  reportIssueLocation,
  locationNotes,
  saveLocationNotes,
  sendEmailBOL,
  getTaskCount,
  clockIn,
  pauseJob,
  clockout,
  resumeJob,
  removeMemberTeam,
  getBolPdf,
};
