/**
 * 可观测性配置
 *
 * 日志、追踪、监控等可观测性配置
 */

import { registerAs } from '@nestjs/config';

export const observabilityConfig = registerAs('observability', () => ({
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
  },
  tracing: {
    enabled: process.env.TRACING_ENABLED === 'true',
    jaegerUrl: process.env.JAEGER_URL,
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true',
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
  },
}));

export type ObservabilityConfig = ReturnType<typeof observabilityConfig>;
