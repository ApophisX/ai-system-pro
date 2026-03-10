import { endpoints } from 'src/lib/axios';

import { useGetData, useGetDataList, useGetDataListWithPagination } from './utils';

export type AssetInventoryListParams = {
  page?: number;
  pageSize?: number;
};

export function useGetMyAssets(params?: MyApi.AppAssetControllerGetMyAssetsV1Params) {
  return useGetDataList<MyApi.OutputMyAssetListItemDto>({
    url: endpoints.asset.my.list,
    config: {
      params,
    },
    page: params?.page,
    pageSize: params?.pageSize,
  });
}

export function useGetAssets(params?: MyApi.AppAssetControllerGetAssetListV1Params) {
  return useGetDataList<MyApi.OutputAssetListItemDto>({
    url: endpoints.asset.root,
    config: {
      params,
    },
  });
}

export function useGetAssetDetail(isMy = false, id?: string) {
  return useGetData<MyApi.OutputAssetDetailDto>({
    url: id ? (isMy ? endpoints.asset.my.detail(id) : endpoints.asset.detail(id)) : '',
  });
}

export function useGetMyAssetDetail(id: string) {
  return useGetData<MyApi.OutputAssetDetailDto>({
    url: endpoints.asset.my.detail(id),
  });
}

export function useGetAssetInventory(params?: MyApi.AppAssetInventoryControllerGetListV1Params) {
  return useGetDataListWithPagination<MyApi.OutputAssetInventoryDto>({
    url: endpoints.assetInventory.root,
    config: {
      params,
    },
  });
}

export function useGetAssetInventoryById(id: string | null) {
  return useGetData<MyApi.OutputAssetInventoryDto>({
    url: id ? endpoints.assetInventory.detail(id) : '',
  });
}
