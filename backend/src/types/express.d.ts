// Express 类型扩展
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        anonymousIdentityId?: string;
        anonymousIdentities?: Array<{
          id: string;
          displayName: string;
          avatarUrl?: string;
        }>;
      };
      anonymousId?: string;
    }
  }
}