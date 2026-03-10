import { endpoints } from 'src/lib/axios';

import { useGetDataList } from './utils';

export function useGetAssetCategories(params?: any) {
  return useGetDataList<MyApi.AppOutputAssetCategoryDto>({
    url: endpoints.asset.categories.root,
    config: {
      params,
    },
  });
}

export function useGetAssetCategoriesTree() {
  return useGetDataList<MyApi.AppOutputAssetCategoryTreeDto>({
    url: endpoints.asset.categories.tree,
    config: {},
  });
}
