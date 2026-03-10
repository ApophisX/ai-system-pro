/**
 * 健康检查控制器
 *
 * 提供健康检查端点
 * - /health - 详细健康状态
 * - /health/live - 存活探针
 * - /health/ready - 就绪探针
 */

import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthService, SystemHealth } from './health.service';
import { NoAuth } from '@/common/decorators/no-auth.decorator';
import type { PromiseApiResponse } from '@/common/dtos/base-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * 获取详细健康状态
   */
  @Get()
  @NoAuth()
  @ApiOperation({ summary: '获取系统健康状态' })
  @ApiResponse({ status: 200, description: '系统健康' })
  @ApiResponse({ status: 503, description: '系统不健康' })
  async getHealth(): PromiseApiResponse<SystemHealth> {
    const health: SystemHealth = await this.healthService.getHealth();
    const statusCode = health.status === 'unhealthy' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

    return {
      code: statusCode === HttpStatus.OK ? 0 : statusCode,
      data: health,
    };
  }

  /**
   * 存活探针（Liveness Probe）
   * 用于 Kubernetes 检测容器是否存活
   */
  @Get('live')
  @NoAuth()
  @ApiOperation({ summary: '存活探针' })
  @ApiResponse({ status: 200, description: '服务存活' })
  async getLiveness(): PromiseApiResponse<{
    status: string;
    timestamp: string;
  }> {
    const result = await this.healthService.getLiveness();
    return {
      data: result,
    };
  }

  /**
   * 就绪探针（Readiness Probe）
   * 用于 Kubernetes 检测服务是否准备好接收流量
   */
  @Get('ready')
  @NoAuth()
  @ApiOperation({ summary: '就绪探针' })
  @ApiResponse({ status: 200, description: '服务就绪' })
  @ApiResponse({ status: 503, description: '服务未就绪' })
  async getReadiness(@Res() res: Response): Promise<void> {
    const result = await this.healthService.getReadiness();

    const statusCode = result.ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
      code: result.ready ? 0 : statusCode,
      message: result.status,
      data: result,
    });
  }
}
