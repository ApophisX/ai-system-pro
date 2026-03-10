import { endpoints } from 'src/lib/axios';

import { useGetData, useGetDataList } from './utils';

/** 承租方押金汇总 */
export function useGetLesseeDepositSummary() {
  return useGetData<MyApi.OutputLesseeDepositSummaryDto>({
    url: endpoints.deposit.lessee.summary,
  });
}

/** 承租方押金明细列表 */
export function useGetLesseeDeposits(params?: MyApi.AppLesseeDepositControllerQueryDepositsV1Params) {
  return useGetDataList<MyApi.OutputDepositDto>({
    url: endpoints.deposit.lessee.root,
    page: params?.page,
    pageSize: params?.pageSize ?? 10,
    config: {
      params,
    },
  });
}
