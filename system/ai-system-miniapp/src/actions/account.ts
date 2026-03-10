import { endpoints, useGetData } from '@/utils/request';

export function useGetAccountCredit(params?: MyApi.AppCreditControllerGetAccountV1Params) {
  const result = useGetData<MyApi.OutputCreditAccountDto>({
    url: endpoints.account.credit,
    config: {
      params,
    },
  });
  return result;
}
