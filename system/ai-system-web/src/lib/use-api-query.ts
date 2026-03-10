import type { AxiosResponse } from 'axios';
import type { QueryKey, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'src/lib/type';

import { useQuery } from '@tanstack/react-query';

import { withApiData } from 'src/lib/axios';

// ----------------------------------------------------------------------

/**
 * 封装 useQuery，让 query.data 直接拿到接口的 data（即 response.data.data），而不需要 data.data.data。
 *
 * apiFn 的返回类型需为 Promise<AxiosResponse<ApiResponse<TData>>>（与当前后端 ApiResponse 一致），
 * TData 会从该返回类型自动推断，无需手写泛型。
 *
 * 当前仅支持无参或可选参的 API；若需传参，可将参数放入 queryKey，在 queryFn 中自行从 context.queryKey 取用。
 *
 * @param apiFn 返回「完整 axios 响应」的接口函数（无参或可选参）
 * @param options 除 queryFn 以外的 useQuery 配置，query.data 即为 TData
 *
 * @example
 * const query = useApiQuery(
 *   API.AppStatistics.AppStatisticsControllerGetLessorFinanceStatisticsV1,
 *   { queryKey: ['lessor-income'] }
 * );
 * console.log(query.data);
 */
export function useApiQuery<TData = unknown, TError = Error, TQueryKey extends QueryKey = QueryKey>(
  apiFn: () => Promise<AxiosResponse<ApiResponse<TData>>>,
  options?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    queryKey: (options?.queryKey ?? ['useApiQuery']) as TQueryKey,
    queryFn: () => withApiData(apiFn() as Promise<AxiosResponse<ApiResponse<TData>>>),
  });
}
