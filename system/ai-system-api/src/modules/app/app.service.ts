import { Injectable } from '@nestjs/common';

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface ServerTimeResponse {
  currentTime: string;
  timestamp: number;
}

@Injectable()
export class AppService {
  private startTime = Date.now();

  getHello(): string {
    return 'Hello World!';
  }

  healthCheck(): HealthCheckResponse {
    const uptime = Date.now() - this.startTime;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000),
    };
  }

  getCurrentServerTime(): ServerTimeResponse {
    const now = new Date();
    return {
      currentTime: now.toISOString(),
      timestamp: now.getTime(),
    };
  }
}
