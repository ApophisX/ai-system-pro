import { Request, Response } from 'express';
import { v4 as uuidv4, validate } from 'uuid';
import { REQUEST_ID_HEADER } from '../constants/request-header.constant';
import { NextFunction } from 'express';

export const RequestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  /** set request id, if not being set yet */
  if (!req.headers[REQUEST_ID_HEADER] || !validate(req.header(REQUEST_ID_HEADER))) {
    req.headers[REQUEST_ID_HEADER] = uuidv4().replaceAll('-', '');
  }

  /** set res id in response from req */
  res.set(REQUEST_ID_HEADER, req.headers[REQUEST_ID_HEADER]);
  next();
};
