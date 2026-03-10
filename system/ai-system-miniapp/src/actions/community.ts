import { endpoints, useGetData, useGetDataList } from '@/utils/request';

/** 社区详情 */
export function useGetCommunityDetail(communityId: string) {
  return useGetData<MyApi.OutputCommunityDto>({
    url: communityId ? endpoints.community.detail(communityId) : '',
    extraConfig: { showLoading: false },
  });
}

/** 我加入的社区列表（支持分页） */
export function useGetMyJoinedCommunities(params?: MyApi.AppCommunityControllerGetMyJoinedV1Params) {
  return useGetDataList<MyApi.OutputCommunityListItemDto>({
    url: endpoints.community.my,
    config: {
      params: params,
    },
    extraConfig: {
      showLoading: false,
    },
  });
}

/** 社区内资产列表（需已加入，支持分页） */
export function useGetCommunityAssets(
  communityId: string,
  params?: Omit<MyApi.AppCommunityAssetControllerGetCommunityAssetsV1Params, 'id'>,
) {
  return useGetDataList<MyApi.OutputAssetListItemDto>({
    url: communityId ? endpoints.community.assets(communityId) : '',
    config: {
      params: params,
    },
    extraConfig: {
      showLoading: false,
    },
  });
}
