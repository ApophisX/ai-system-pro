import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestContext } from '../dtos/request-context.dto';
import { createRequestContext } from '../utils/request-context.util';
import { Request } from 'express';

export const ReqContext = createParamDecorator((data: unknown, ctx: ExecutionContext): RequestContext => {
  const request: Request = ctx.switchToHttp().getRequest();
  return createRequestContext(request);
});
