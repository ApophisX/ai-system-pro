import { endpoints, useGetData, useGetDataList } from '@/utils/request';

export function useGetMessages(parmas?: MyApi.AppMessageControllerGetListV1Params) {
  const result = useGetDataList<MyApi.OutputMessageDto>({
    url: endpoints.message.root,
    config: {
      params: parmas,
    },
  });
  return result;
}

export function useGetMessageUnreadCount() {
  const result = useGetData<number>({
    url: endpoints.message.unreadCount,
  });
  return result;
}
