
export interface ApiResponse<T> {
  body: T;
  message: string;
  service: string;
}
