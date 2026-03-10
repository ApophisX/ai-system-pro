import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { REQUEST_ID_HEADER, TENANT_ID_HEADER } from '../constants/request-header.constant';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['context'] = {
      tenantId: req.headers[TENANT_ID_HEADER] || null,
      requestId: req.headers[REQUEST_ID_HEADER] || uuidv4(),
      user: null, // 如果你有登录系统
    };
    next();
  }
}
