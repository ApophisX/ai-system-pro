import { endpoints } from 'src/lib/axios';

import { useGetData, useGetDataList } from './utils';

export function useGetMyFavorites(params?: MyApi.AppFavoriteControllerGetListV1Params) {
  return useGetDataList<MyApi.OutputFavoriteDto>({
    url: endpoints.favorite.root,
    config: {
      params,
    },
    page: params?.page,
    pageSize: params?.pageSize,
  });
}
