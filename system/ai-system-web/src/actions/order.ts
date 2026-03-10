import { useQuery } from '@tanstack/react-query';

import API from 'src/services/API';
import { endpoints } from 'src/lib/axios';

import { useGetData, useGetDataList } from './utils';

export function useQueryOrderDetail(orderId: string) {
  return useQuery({
    gcTime: 0,
    staleTime: 0,
    queryKey: ['order-detail', orderId],
    queryFn: () =>
      API.AppRentalOrderLessee.AppRentalOrderLesseeControllerGetOrderByIdV1({ id: orderId }),
    select: (res) => res.data.data,
  });
}

export function useGetLesseeOrders(
  query?: MyApi.AppRentalOrderLesseeControllerQueryOrdersV1Params
) {
  const result = useGetDataList<MyApi.OutputRentalOrderDto>({
    url: endpoints.rentalOrder.lessee.root,
    page: query?.page,
    config: {
      params: query,
    },
  });
  return result;
}

export function useGetOrderDetail(orderId: string) {
  const result = useGetData<MyApi.OutputRentalOrderDto>({
    url: endpoints.rentalOrder.lessee.detail(orderId),
  });
  return result;
}

export function useGetLessorPendingOrders(
  query?: MyApi.AppRentalOrderLessorControllerQueryPendingOrdersV1Params
) {
  const result = useGetDataList<MyApi.OutputRentalOrderDto>({
    url: endpoints.rentalOrder.lessor.pending,
    page: query?.page,
    pageSize: query?.pageSize ?? 20,
    config: {
      params: query,
    },
  });
  return result;
}

export function useGetLessorOrders(
  query?: MyApi.AppRentalOrderLessorControllerQueryOrdersV1Params
) {
  const result = useGetDataList<MyApi.OutputRentalOrderDto>({
    url: endpoints.rentalOrder.lessor.root,
    page: query?.page,
    pageSize: query?.pageSize ?? 20,
    config: {
      params: query,
    },
  });
  return result;
}

export function useGetLessorOrderDetail(orderId: string) {
  const result = useGetData<MyApi.OutputRentalOrderDto>({
    url: endpoints.rentalOrder.lessor.detail(orderId),
  });
  return result;
}
