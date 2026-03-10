import { useMemo } from 'react';

import { endpoints } from 'src/lib/axios';

import { useGetDataListWithPagination } from './utils';

export function useGetMessages(params?: MyApi.AppMessageControllerGetListV1Params) {
  const config = useMemo(
    () => ({
      params,
    }),
    [params]
  );
  const result = useGetDataListWithPagination<MyApi.OutputMessageDto>({
    url: endpoints.message.root,
    config,
  });
  return result;
}
