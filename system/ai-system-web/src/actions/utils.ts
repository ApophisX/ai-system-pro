import type { SWRConfiguration } from 'swr';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponseData } from 'src/lib/type';

import useSWR from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetcher } from 'src/lib/axios';

const SWR_DEFAULT_OPTIONS: SWRConfiguration = {
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 0,
};

type Props = {
  url?: string | null;
  config?: AxiosRequestConfig;
  swrOptions?: SWRConfiguration;
  page?: number;
  pageSize?: number;
};

export function useGetDataList<T = any>({
  url,
  swrOptions,
  config,
  page = 0,
  pageSize = 10,
}: Props) {
  const allDataRef = useRef<Array<T[]>>([]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<ApiResponseData<T[]>>(
    [url, config],
    url ? fetcher : null,
    {
      ...SWR_DEFAULT_OPTIONS,
      ...swrOptions,
    }
  );

  const allData = useMemo(() => {
    if (data?.data) {
      allDataRef.current[page] = [...data.data];
    }
    const list = allDataRef.current.flat();
    return [...list];
  }, [data, page]);

  const memoizedValue = useMemo(() => {
    const count = data?.data?.length || 0;

    return {
      mutate,
      allData,
      clearCache: () => {
        allDataRef.current = [];
      },
      data: data?.data || [],
      meta: data?.meta,
      dataLoading: isLoading,
      isFirstDataLoading: (isLoading && page === 0) || (isValidating && page === 0),
      dataError: error,
      dataValidating: isValidating,
      dataEmpty: !isLoading && !isValidating && !data?.data?.length,
      hasMore: count === pageSize,
    };
  }, [data?.data, data?.meta, mutate, allData, isLoading, page, error, isValidating, pageSize]);
  return memoizedValue;
}

export function useGetDataListWithPagination<T = any>({
  url,
  swrOptions,
  config,
  page: pageParam = 0,
  pageSize = 10,
}: Props) {
  const allDataRef = useRef<Array<T[]>>([]);
  const [page, setPage] = useState(pageParam);

  // 筛选参数变化时（如 type）重置分页，避免跨类型数据污染
  const filterParamsKey = useMemo(() => {
    const params = config?.params || {};
    const filterParams = Object.fromEntries(
      Object.entries(params).filter(([k]) => k !== 'page' && k !== 'pageSize')
    );
    return JSON.stringify(filterParams);
  }, [config?.params]);

  useEffect(() => {
    allDataRef.current = [];
    setPage(0);
  }, [filterParamsKey]);

  // 合并分页参数到请求配置中
  const requestConfig = useMemo(
    () => ({
      ...config,
      params: {
        ...config?.params,
        page,
        pageSize,
      },
    }),
    [config, page, pageSize]
  );

  // SWR key 包含所有影响请求的参数
  const { data, isLoading, error, isValidating, mutate } = useSWR<ApiResponseData<T[]>>(
    url ? [url, requestConfig] : null,
    url ? fetcher : null,
    {
      ...SWR_DEFAULT_OPTIONS,
      ...swrOptions,
    }
  );

  const allData = useMemo(() => {
    if (data?.data) {
      allDataRef.current[page] = [...data.data];
    }
    // filter(Boolean) 过滤掉快速 loadMore 时产生的空槽位，避免第一页数据丢失
    const list = allDataRef.current.filter(Boolean).flat();
    return list;
  }, [data, page]);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const reload = useCallback(() => {
    allDataRef.current = [];
    setPage(0);
    mutate?.();
  }, [mutate]);

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
      page,
      data: data?.data || [],
      meta: data?.meta,
      dataLoading: isLoading,
      isFirstDataLoading: (isLoading || isValidating) && page === 0,
      dataError: error,
      dataValidating: isValidating,
      dataEmpty: !isLoading && !isValidating && !data?.data?.length,
      hasMore: count === pageSize,
    };
  }, [
    data?.data,
    data?.meta,
    mutate,
    allData,
    clearCache,
    loadMore,
    reload,
    page,
    isLoading,
    error,
    isValidating,
    pageSize,
  ]);
  return memoizedValue;
}

export function useGetData<T = any>({ url, swrOptions, config }: Props) {
  const { data, isLoading, error, isValidating, mutate } = useSWR<{ data: T }>(
    [url, config],
    url ? fetcher : null,
    {
      ...SWR_DEFAULT_OPTIONS,
      ...swrOptions,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      mutate,
      data: data?.data,
      dataLoading: isLoading,
      dataError: error,
      dataValidating: isValidating,
    }),
    [error, isLoading, isValidating, mutate, data]
  );

  return memoizedValue;
}
