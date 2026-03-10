import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/app';
import Taro from '@tarojs/taro';
import { useCallback, useMemo, useRef, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

// ==================== 类型定义 ====================

export type ResponseResult<T> = {
  code: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type RequestExtraConfig = {
  showLoading?: boolean;
  showError?: boolean;
  title?: string;
  useToken?: boolean;
  useFullUrl?: boolean;
  retry?: boolean; // 是否自动重试
  retryCount?: number; // 重试次数
  timeout?: number; // 超时时间（毫秒）
};

export type UseGetDataProps<T = unknown> = {
  extraConfig?: RequestExtraConfig;
  swrOptions?: SWRConfiguration;
  config?: Partial<Taro.request.Option<ResponseResult<T>>> & { params: any };
  page?: number;
  pageSize?: number;
} & Partial<Taro.request.Option<ResponseResult<T>>>;

// ==================== 配置常量 ====================

const DEFAULT_TIMEOUT = 30000; // 默认30秒超时
const TOAST_DELAY = 350; // Toast 延迟显示时间
const TOAST_DURATION = 1500;
const MAX_RETRY_COUNT = 2;

const swrDefaultOptions: SWRConfiguration = {
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ==================== Loading 管理器 ====================

class LoadingManager {
  private loadingCount = 0;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  show(title = '加载中...'): void {
    this.loadingCount++;
    // 防抖：延迟显示 loading，避免闪烁
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.loadingTimer = setTimeout(() => {
      if (this.loadingCount > 0) {
        Taro.showLoading({ title, mask: true });
      }
    }, 100);
  }

  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      Taro.hideLoading({ noConflict: true });
    }
  }

  reset(): void {
    this.loadingCount = 0;
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
    Taro.hideLoading({ noConflict: true });
  }
}

const loadingManager = new LoadingManager();

// ==================== 工具函数 ====================

/**
 * 安全显示 Toast
 */
function showToast(message: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none'): void {
  setTimeout(() => {
    Taro.showToast({
      title: message,
      icon,
      duration: TOAST_DURATION,
      mask: false,
    });
  }, TOAST_DELAY);
}

/**
 * 获取完整的请求 URL
 */
function getRequestUrl(url: string, useFullUrl: boolean): string {
  if (!url) {
    throw new Error('请求 URL 不能为空');
  }
  if (useFullUrl) {
    return url;
  }
  // 确保 API_HOST 存在
  if (typeof APP_API_HOST !== 'string' || !APP_API_HOST) {
    throw new Error('APP_API_HOST 未配置');
  }
  // 处理 URL 拼接，避免双斜杠
  const baseUrl = APP_API_HOST.endsWith('/') ? APP_API_HOST.slice(0, -1) : APP_API_HOST;
  const apiPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${apiPath}`;
}

/**
 * 构建请求头
 */
function buildHeaders(useToken: boolean, customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...customHeaders,
  };

  if (useToken) {
    try {
      const accessToken = Taro.getStorageSync(ACCESS_TOKEN_STORAGE_KEY);
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.warn('获取 token 失败:', error);
    }
  }

  return headers;
}

/**
 * 处理响应数据
 */
function handleResponse<T>(res: Taro.request.SuccessCallbackResult, useFullUrl: boolean): T {
  // 如果是完整 URL 请求，直接返回数据
  if (useFullUrl) {
    return {
      code: 0,
      message: 'success',
      data: res.data,
    } as T;
  }

  // 标准响应格式处理
  const result = res.data as ResponseResult<T>;
  if (!result || typeof result !== 'object') {
    throw new Error('响应数据格式错误');
  }

  if (result.code === 0) {
    return result as T;
  }

  // 业务错误
  const errorMessage = result.message || '请求失败';
  throw new Error(errorMessage);
}

/**
 * 请求错误类型
 */
type RequestError = {
  errMsg?: string;
  status?: number;
  data?: { message?: string };
};

/**
 * 处理请求错误
 */
function handleError(err: RequestError, showError: boolean): void {
  const status = err.status;
  const errorData = err.data;

  if (status === 400) {
    // 客户端错误
    const message = errorData?.message || '请求参数错误';
    if (showError) {
      showToast(message);
    }
  } else if (status === 401) {
    // 未授权，触发会话检查
    Taro.eventCenter.trigger('onCheckUserSession');
    try {
      const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_STORAGE_KEY);
      if (!refreshToken) {
        if (showError) {
          showToast('登录已过期，请重新登录');
        }
      }
    } catch (error) {
      console.warn('获取 refresh token 失败:', error);
      if (showError) {
        showToast('登录已过期，请重新登录');
      }
    }
  } else if (status === 403) {
    // 禁止访问
    if (showError) {
      showToast('没有权限访问该资源');
    }
  } else if (status === 404) {
    // 资源不存在
    if (showError) {
      showToast('请求的资源不存在');
    }
  } else if (status === 500) {
    // 服务器错误
    if (showError) {
      showToast('服务器错误，请稍后重试');
    }
  } else if (status === 503) {
    // 服务不可用
    if (showError) {
      showToast('服务暂时不可用，请稍后重试');
    }
  } else if (showError) {
    // 网络错误或其他错误
    const message = errorData?.message || '网络错误，请稍后重试';
    showToast(message);
  }
}

/**
 * 创建带超时的请求
 */
function createTimeoutPromise<T>(timeout: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`请求超时（${timeout}ms）`));
    }, timeout);
  });
}

// ==================== 核心请求函数 ====================

/**
 * 核心请求函数
 * @param options 请求配置
 * @param extraConfig 额外配置
 * @returns Promise<ResponseResult<T>>
 */
export function request<T = unknown>(
  url: string,
  options: Partial<Taro.request.Option<ResponseResult<T>>> & Record<string, any>,
  extraConfig?: RequestExtraConfig,
): Promise<T> {
  const {
    useFullUrl = false,
    showLoading = true,
    showError = true,
    useToken = true,
    title = '加载中...',
    retry = false,
    retryCount = MAX_RETRY_COUNT,
    timeout = DEFAULT_TIMEOUT,
  } = extraConfig || {};

  const hideLoading = Taro.getStorageSync('hideLoading');
  // 显示 loading
  if (showLoading && hideLoading !== 'true') {
    loadingManager.show(title);
  }

  // 构建请求配置
  const requestOptions: Taro.request.Option<ResponseResult<T>> = {
    ...options,
    url: getRequestUrl(url || '', useFullUrl),
    header: buildHeaders(useToken, options.header as Record<string, string> | undefined),
    timeout: Math.min(timeout, options.timeout || timeout),
  };

  // 执行请求
  const executeRequest = (): Promise<T> => {
    const requestPromise = new Promise<T>((resolve, reject) => {
      Taro.request<ResponseResult<T>>({
        ...requestOptions,
        success: res => {
          try {
            const result = handleResponse<T>(res, useFullUrl);
            resolve(result);
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
        fail: err => {
          handleError(err as RequestError, showError);
          reject(err);
        },
        complete: () => {
          if (showLoading) {
            loadingManager.hide();
          }
        },
      });
    });

    // 超时控制
    if (timeout > 0) {
      const timeoutPromise = createTimeoutPromise<never>(timeout);
      return Promise.race([requestPromise, timeoutPromise]);
    }

    return requestPromise;
  };

  // 重试逻辑
  if (retry && retryCount > 0) {
    let attempts = 0;
    const attemptRequest = (): Promise<T> => {
      attempts++;
      return executeRequest().catch(error => {
        // 只有网络错误才重试，业务错误不重试
        const isNetworkError = !error.status || error.status >= 500;
        if (isNetworkError && attempts <= retryCount) {
          console.warn(`请求失败，正在重试 (${attempts}/${retryCount}):`, requestOptions.url);
          // 延迟重试，避免频繁请求
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(attemptRequest());
            }, 1000 * attempts); // 递增延迟
          });
        }
        throw error;
      });
    };
    return attemptRequest();
  }

  return executeRequest();
}

/**
 * 上传文件
 * @param filePath 文件路径
 * @param url 上传地址（可选）
 * @param name 文件字段名（默认 "file"）
 * @param formData 额外表单数据（可选）
 * @returns Promise<{ path: string; type: string }>
 */
export function uploadFile(
  filePath: string,
  url?: string,
  name = 'file',
  formData?: Record<string, string>,
): Promise<{ path: string; type: string }> {
  if (!filePath) {
    return Promise.reject(new Error('文件路径不能为空'));
  }

  const uploadUrl = url || getRequestUrl('/file/upload-user-profile', false);

  return new Promise<{ path: string; type: string }>((resolve, reject) => {
    try {
      const accessToken = Taro.getStorageSync(ACCESS_TOKEN_STORAGE_KEY);
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      Taro.uploadFile({
        url: uploadUrl,
        filePath,
        name,
        header: headers,
        formData: formData || {},
        success: res => {
          try {
            if (!res.data) {
              throw new Error('上传响应数据为空');
            }
            const result = JSON.parse(res.data) as ResponseResult<{
              path: string;
              type: string;
            }>;
            if (result.code === 0 && result.data) {
              resolve(result.data);
            } else {
              const errorMessage = result.message || '上传失败';
              showToast(errorMessage);
              reject(new Error(errorMessage));
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '解析上传响应失败';
            console.error('解析上传响应失败:', error, res.data);
            showToast(errorMessage);
            reject(new Error(errorMessage));
          }
        },
        fail: err => {
          const errorMessage = err.errMsg || '上传失败';
          console.error('上传失败:', err);
          showToast(errorMessage);
          reject(new Error(errorMessage));
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传初始化失败';
      console.error('上传初始化失败:', error);
      reject(new Error(errorMessage));
    }
  });
}

/**
 * SWR fetcher 函数
 * @param args 请求参数，可以是单个配置或 [配置, 额外配置] 元组
 * @returns Promise<ResponseResult<T>>
 */
export const fetcher = async <T = unknown>(
  args: Taro.request.Option<ResponseResult<T>> | [Taro.request.Option<ResponseResult<T>>, RequestExtraConfig],
): Promise<T> => {
  const [options, extraConfig] = Array.isArray(args) ? args : [args, {}];

  // 参数验证
  if (!options || typeof options !== 'object') {
    throw new Error('请求配置无效');
  }

  if (!options.url) {
    throw new Error('请求 URL 不能为空');
  }

  try {
    const res = await request<T>(options.url, options, extraConfig);
    return res;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '请求失败';
    console.error('Fetcher failed:', errorMessage, {
      url: options.url,
      method: options.method,
      extraConfig,
    });
    throw error;
  }
};

/**
 * 获取数据列表的 Hook
 * @param props 请求配置
 * @returns 数据列表相关的状态和方法
 */
export function useGetDataList<T = Record<string, any>>(props: UseGetDataProps<T>) {
  const allDataRef = useRef<Array<T[]>>([]);

  const { swrOptions, extraConfig = {}, config, ...options } = props;
  const { page: pageParam = 0, pageSize = 10 } = config?.params || {};

  const [page, setPage] = useState(config?.params?.page || pageParam);

  if (config && options.url) {
    const paramsObj: [string, string][] = Object.entries(config.params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, (value as any).toString()]);
    paramsObj.push(['page', page.toString()]);
    paramsObj.push(['pageSize', pageSize.toString()]);
    const urlParams = new URLSearchParams(paramsObj);
    options.url = `${options.url}?${urlParams.toString()}`;
  }

  if (page > 0) {
    extraConfig.showLoading = false;
  }

  // 只有当 url 存在时才启用请求
  const key = options.url ? [options, extraConfig] : null;

  const result = useSWR<ResponseResult<T[]>>(key, fetcher, {
    ...swrDefaultOptions,
    ...swrOptions,
  });

  const { data, isLoading, error, isValidating, mutate } = result;

  const allData = useMemo(() => {
    if (data?.data) {
      allDataRef.current[page] = [...data.data];
    }
    const list = allDataRef.current.flat();
    return [...list];
  }, [data, page]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, [data?.data]);

  const reload = useCallback(async () => {
    allDataRef.current = [];
    setPage(0);
    await mutate();
  }, []);

  const clearCache = useCallback(() => {
    allDataRef.current = [];
  }, []);

  const memoizedValue = useMemo(() => {
    const count = data?.data?.length || 0;

    return {
      mutate,
      allData,
      clearCache,
      loadMore,
      reload,
      data: data?.data || [],
      meta: data?.meta,
      dataLoading: isLoading,
      isFirstDataLoading: isLoading && page === 0,
      dataError: error,
      dataValidating: isValidating,
      dataEmpty: !isLoading && !isValidating && !data?.data?.length,
      hasMore: count === pageSize,
    };
  }, [error, isLoading, isValidating, mutate, data]);

  return memoizedValue;
}

/**
 * 获取单个数据的 Hook
 * @param props 请求配置
 * @returns 数据相关的状态和方法
 */
export function useGetData<T = unknown>(props: UseGetDataProps<T>) {
  const { swrOptions, extraConfig, ...options } = props;

  // 只有当 url 存在时才启用请求
  const key = options.url ? [options, extraConfig] : null;

  const result = useSWR<ResponseResult<T>>(key, fetcher, {
    ...swrDefaultOptions,
    ...swrOptions,
  });

  const { data, isLoading, error, isValidating, mutate } = result;

  const memoizedValue = useMemo(
    () => ({
      mutate,
      data: (data?.data ?? null) as T | null,
      dataLoading: isLoading,
      dataError: error,
      dataValidating: isValidating,
      dataEmpty: !isLoading && !isValidating && data?.data == null,
    }),
    [error, isLoading, isValidating, mutate, data],
  );

  return memoizedValue;
}

export const API_PREFIX = '/api/v1';
export const endpoints = {
  account: {
    credit: `${API_PREFIX}/app/credit/account`,
  },
  message: {
    root: `${API_PREFIX}/app/message`,
    unreadCount: `${API_PREFIX}/app/message/unread/count`,
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
  community: {
    root: `${API_PREFIX}/app/communities`,
    my: `${API_PREFIX}/app/communities/my`,
    detail: (id: string) => `${API_PREFIX}/app/communities/${id}`,
    assets: (id: string) => `${API_PREFIX}/app/communities/${id}/assets`,
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
