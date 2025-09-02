
export interface ApiResponse<T> {
  body: T;
  message: string;
  service: string;
  status? : number;
  statusText? : string;
}

export type Paginated<T> = {data: T; total: number};

export type GeneralListApi = {
  id: string;
  name: string;
};