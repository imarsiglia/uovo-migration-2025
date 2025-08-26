import {API_CALENDAR_TIMELINE, API_TIMELINE} from '@api/contants/endpoints';
import {getRequest} from '@api/helpers/apiClientHelper';
import { JobType } from '@api/types/Jobs';

export type Paginated<T> = {data: T; total: number};

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

export const jobServices = {
  calendar,
  timeline,
};
