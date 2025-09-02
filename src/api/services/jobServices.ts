import {
  API_CALENDAR_TIMELINE,
  API_JOBQUEUE,
  API_LOCATION_LETSGO,
  API_TIMELINE,
  API_TOPSHEET,
} from '@api/contants/endpoints';
import {getRequest, postRequest} from '@api/helpers/apiClientHelper';
import {JobDetailType, JobType} from '@api/types/Jobs';
import {Paginated} from '@api/types/Response';

const calendar = async (month: number, year: number): Promise<string[]> => {
  const response = await getRequest<Paginated<string[]>>(
    `${API_CALENDAR_TIMELINE}?month=${month}&year=${year}`,
  );
  return response.body?.data ?? [];
};

const timeline = async (date: string): Promise<JobType[]> => {
  const response = await getRequest<Paginated<JobType[]>>(
    `${API_TIMELINE}?date=${date}&start=0&limit=20&totalize=1`,
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
  queue: number;
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

export const jobServices = {
  calendar,
  timeline,
  jobqueue,
  topsheet,
  letsGo,
};
