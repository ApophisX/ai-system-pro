import { endpoints, useGetDataList } from '@/utils/request';

export function useGetAssetCategories(params: MyApi.AppAssetCategoryControllerGetCategoriesV1Params = {}) {
  return useGetDataList<MyApi.AppOutputAssetCategoryDto>({
    url: `${endpoints.asset.categories.root}`,
    config: {
      params,
    },
  });
}

export function useGetAssets(params?: MyApi.AppAssetControllerGetAssetListV1Params) {
  return useGetDataList<MyApi.OutputAssetListItemDto>({
    url: endpoints.asset.root,
    config: {
      params: params,
    },
    extraConfig: {
      showLoading: false,
    },
  });
}
