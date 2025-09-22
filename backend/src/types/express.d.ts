// Express 类型扩展
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      anonymousId?: string;
    }
  }
}