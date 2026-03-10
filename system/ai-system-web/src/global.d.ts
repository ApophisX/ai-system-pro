import type {} from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    fetchOptions?: {
      showError?: boolean;
      showSuccess?: boolean;
      useApiMessage?: boolean;
      successMessage?: string;
      errorMessage?: string;
      disableTenant?: boolean;
      [key: string]: any;
    };
  }
  export interface AxiosRequestConfig {
    fetchOptions?: {
      showSuccess?: boolean;
      showError?: boolean;
      silent?: boolean;
    };
  }
}
