import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './type';

import axios, { AxiosError, HttpStatusCode } from 'axios';

import { CONFIG } from 'src/global-config';
import {
  TENANT_STORAGE_KEY,
  AXIOS_HEADER_TENANT_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
} from 'src/constants/global-constant';

import { toast } from 'src/components/snackbar';

import { isTokenExpired } from 'src/auth/context/jwt';

import { tokenManager } from './token-manager';

const DEFAULT_SUCCESS_MSG: Record<string, string> = {
  post: '创建成功',
  put: '更新成功',
  patch: '更新成功',
  delete: '删除成功',
};

const DEFAULT_ERROR_MSG: Record<string, string> = {
  post: '创建失败',
  put: '更新失败',
  patch: '更新失败',
  delete: '删除失败',
};

export class BusinessError extends AxiosError {
  code: any;
  constructor(message: string, options?: { code: any }) {
    super(message);
    this.message = message;
    this.code = options?.code || -1;
    this.name = 'BusinessError';
  }
}

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Optional: Add token (if using auth)
 *
 axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*
*/

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

// 请求拦截
axiosInstance.interceptors.request.use(async (config) => {
  const tenantId = localStorage.getItem(TENANT_STORAGE_KEY) || '';
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (token && isTokenExpired(token)) {
    try {
      const newToken = await tokenManager.refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
    } catch (error) {
      console.log(error);
    }
  }
  if (tenantId) {
    config.headers[AXIOS_HEADER_TENANT_KEY] = `${tenantId}`;
  }

  return config;
});

// 返回拦截
axiosInstance.interceptors.response.use((response) => {
  const { code, message } = (response.data || {}) as ApiResponse;
  const {
    showSuccess = true,
    successMessage,
    showError = true,
    useApiMessage = true,
    useApiData = false,
  } = response.config?.fetchOptions || {};
  const requestId = response.headers['request-id'];
  const method = response.config?.method?.toLowerCase() || '';
  if (code === 0 || response.status === HttpStatusCode.NoContent) {
    if (showSuccess && method !== 'get') {
      const defaultMsg = successMessage || DEFAULT_SUCCESS_MSG[method] || '操作成功';
      const successMsg = useApiMessage ? message || defaultMsg : defaultMsg;
      toast.dismiss(requestId);
      toast.success(successMsg, { id: requestId });
    }
  } else {
    if (showError) {
      toast.error(message || DEFAULT_ERROR_MSG[method], { id: requestId });
    }
    throw new BusinessError(message || DEFAULT_ERROR_MSG[method], { code });
  }
  return useApiData ? response.data : response;
}, handleRequestError);

// 处理请求错误
async function handleRequestError(error: AxiosError<ApiResponse>) {
  const { code, message, status, response } = error;
  const { message: resErrMsg } = response?.data || {};
  let errorMessage = message;

  if (errorMessage === 'Unauthorized') {
    return;
  }

  const { showError = true } = error.response?.config?.fetchOptions || {};

  let _showError = showError;
  if (code === AxiosError.ECONNABORTED) {
    errorMessage = '网络异常，请检查您的网络环境！';
  } else if (code === AxiosError.ERR_NETWORK) {
    errorMessage = '服务异常，请收稍后再试！';
  } else {
    switch (status) {
      case undefined:
      case HttpStatusCode.BadRequest:
      case HttpStatusCode.MethodNotAllowed:
      case HttpStatusCode.TooManyRequests:
        errorMessage = resErrMsg ? `${resErrMsg}` : message;
        break;
      case 401:
        _showError = false;
        await handleUnauthorized(error);
        errorMessage = message || '登录过期，请重新登录！';
        break;
      case 403:
        errorMessage = '无权访问，请联系管理员！';
        break;
      case 404:
        errorMessage = '资源不存在';
        break;
      case 500:
        errorMessage = '服务器异常，请稍后重试！';
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = '服务器异常，请检查您的网络环境！';
        break;
      default:
        errorMessage = '系统异常，请稍后重试！';
    }
  }

  if (_showError) {
    toast.dismiss(code);
    toast.error(errorMessage, { id: code });
  }

  throw error;
}

async function handleUnauthorized(error: AxiosError<ApiResponse>) {
  const originalRequest = error.config;
  if (error.status === 401 && originalRequest && !originalRequest?._retry) {
    originalRequest._retry = true;
    try {
      const newToken = await tokenManager.refreshAccessToken();
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    } catch (err) {
      console.log(err);
    }
  }
}

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------
export const API_PREFIX = '/api/v1';
export const endpoints = {
  message: {
    root: `${API_PREFIX}/app/message`,
  },
  statistics: {
    lessee: {
      root: `${API_PREFIX}/app/statistics/lessee`,
      order: {
        root: `${API_PREFIX}/app/statistics/lessee/orders`,
      },
    },
    lessor: {
      root: `${API_PREFIX}/app/statistics/lessor`,
      pendingOrders: `${API_PREFIX}/app/statistics/lessor/pending-orders`,
    },
  },
  rentalOrder: {
    root: `${API_PREFIX}/app/rental-order`,
    lessee: {
      root: `${API_PREFIX}/app/rental-order/lessee`,
      detail: (id: string) => `${API_PREFIX}/app/rental-order/lessee/${id}`,
    },
    lessor: {
      root: `${API_PREFIX}/app/rental-order/lessor`,
      pending: `${API_PREFIX}/app/rental-order/lessor/pending`,
      detail: (id: string) => `${API_PREFIX}/app/rental-order/lessor/${id}`,
    },
  },
  contact: {
    root: `${API_PREFIX}/app/contact`,
    default: `${API_PREFIX}/app/contact/default/current`,
  },
  assetInventory: {
    root: `${API_PREFIX}/app/asset-inventory`,
    detail: (id: string) => `${API_PREFIX}/app/asset-inventory/${id}`,
  },
  asset: {
    root: `${API_PREFIX}/app/asset`,
    detail: (id: string) => `${API_PREFIX}/app/asset/${id}`,
    categories: {
      root: `${API_PREFIX}/app/asset-categories`,
      tree: `${API_PREFIX}/app/asset-categories/tree`,
    },
    my: {
      list: `${API_PREFIX}/app/asset/my/list`,
      detail: (id: string) => `${API_PREFIX}/app/asset/my/${id}`,
      inventory: (assetId: string) => `${API_PREFIX}/app/asset/my/${assetId}/inventory`,
    },
  },
  favorite: {
    root: `${API_PREFIX}/app/favorite`,
  },
  deposit: {
    lessee: {
      root: `${API_PREFIX}/app/deposit/lessee`,
      summary: `${API_PREFIX}/app/deposit/lessee/summary`,
    },
  },
  sms: {
    root: `${API_PREFIX}/sms`,
    send: `${API_PREFIX}/sms/send`,
    verify: `${API_PREFIX}/sms/verify`,
  },
  captcha: {
    root: `${API_PREFIX}/captcha`,
    svg: `${API_PREFIX}/captcha/svg`,
  },
  chat: `${API_PREFIX}/chat`,
  kanban: `${API_PREFIX}/kanban`,
  calendar: `${API_PREFIX}/calendar`,
  auth: {
    me: `${API_PREFIX}/auth/me`,
    signIn: `${API_PREFIX}/auth/sign-in`,
    signUp: `${API_PREFIX}/auth/sign-up`,
    refreshToken: `${API_PREFIX}/auth/refresh-token`,
    resetPassword: `${API_PREFIX}/auth/reset-password`,
  },
  mail: {
    list: `${API_PREFIX}/mail/list`,
    details: `${API_PREFIX}/mail/details`,
    labels: `${API_PREFIX}/mail/labels`,
  },
  post: {
    list: `${API_PREFIX}/post/list`,
    details: `${API_PREFIX}/post/details`,
    latest: `${API_PREFIX}/post/latest`,
    search: `${API_PREFIX}/post/search`,
  },
  product: {
    list: `${API_PREFIX}/product/list`,
    details: `${API_PREFIX}/product/details`,
    search: `${API_PREFIX}/product/search`,
  },
} as const;

export async function withApiData<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

export async function withApiResponse<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const res = await promise;
  return res.data;
}
