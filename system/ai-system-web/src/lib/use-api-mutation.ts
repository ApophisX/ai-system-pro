import type { UseMutationResult, UseMutationOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'src/lib/type';

import { useMutation } from '@tanstack/react-query';

import { withApiResponse } from 'src/lib/axios';

// ----------------------------------------------------------------------

/** 与后端约定一致：response.data 形如 { code?, message?, data: T }，用于从 api 返回类型推断 TData */
type ApiResponseLike<T> = { data: T };

/**
 * 封装 useMutation，让 onSuccess 直接拿到接口的 data，而不需要 data.data.data。
 *
 * apiFn 的返回类型需为 Promise<AxiosResponse<{ data: TData }>>（与当前后端 ApiResponse 一致），
 * TData 会从该返回类型自动推断，无需手写泛型。
 *
 * @param apiFn 返回「完整 axios 响应」的接口函数
 * @param options 除 mutationFn 以外的 useMutation 配置，onSuccess(data) 中的 data 为 TData
 *
 * @example
 * const mutation = useApiMutation(
 *   API.Recognition.RecognitionControllerOcrIdCardV1,
 *   {
 *     onSuccess: (data) => {
 *       // data 为 MyApi.OutputIdCardOcrDto，不再是 data.data.data
 *     },
 *   }
 * );
 */
export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  apiFn: (variables: TVariables) => Promise<ApiResponseLike<TData>>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    ...options,
    mutationFn: (variables: TVariables) =>
      withApiResponse(apiFn(variables) as Promise<ApiResponse<TData>>),
  });
}
