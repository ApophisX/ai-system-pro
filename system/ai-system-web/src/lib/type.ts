type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type ApiResponseData<T = any> = {
  data: T;
  meta?: ApiResponseMeta & Pagination;
};

export type ApiResponse<T = any> = {
  code: number;
  message: string;
} & ApiResponseData<T>;

export type ApiResponseMeta = {
  total: number;
  [key: string]: any;
};
