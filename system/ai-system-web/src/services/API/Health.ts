// @ts-ignore
/* eslint-disable */
import request from "src/lib/axios";

/** 获取系统健康状态 GET /api/v1/health */
export async function HealthControllerGetHealthV1(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/health", {
    method: "GET",
    ...(options || {}),
  });
}

/** 存活探针 GET /api/v1/health/live */
export async function HealthControllerGetLivenessV1(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/health/live", {
    method: "GET",
    ...(options || {}),
  });
}

/** 就绪探针 GET /api/v1/health/ready */
export async function HealthControllerGetReadinessV1(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/health/ready", {
    method: "GET",
    ...(options || {}),
  });
}
