import { endpoints } from "src/lib/axios";

import { useGetData } from "./utils";


export function useGetLesseeStatistics() {
  return useGetData<MyApi.OutputLesseeStatisticsDto>({ url: endpoints.statistics.lessee.root, })
}



export function useGetLesseeOrderStatistics() {
  return useGetData<MyApi.OutputLesseeOrderStatisticsDto>({ url: endpoints.statistics.lessee.order.root, })
}


export function useGetLessorStatistics() {
  return useGetData<MyApi.OutputLessorStatisticsDto>({ url: endpoints.statistics.lessor.root, })
}

export function useGetLessorPendingOrdersStatistics() {
  return useGetData<MyApi.OutputLessorPendingOrderStatisticsDto>({ url: endpoints.statistics.lessor.pendingOrders, })
}