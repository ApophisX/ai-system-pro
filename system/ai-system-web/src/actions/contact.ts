import { endpoints } from 'src/lib/axios';

import { useGetData, useGetDataList } from './utils';

export function useGetContactList(params: MyApi.AppContactControllerGetMyContactsV1Params) {
  return useGetDataList<MyApi.OutputContactDto>({
    url: endpoints.contact.root,
    config: {
      params,
    },
    page: params?.page,
    pageSize: params?.pageSize,
  });
}

export function useGetMyDefaultContact() {
  return useGetData<MyApi.OutputContactDto>({
    url: endpoints.contact.default,
  });
}
