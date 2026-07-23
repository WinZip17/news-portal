export * from './news';
export * from './auth';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
