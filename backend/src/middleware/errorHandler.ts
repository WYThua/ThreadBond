import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = '服务器内部错误';
  let details: any = null;

  // 开发环境下显示详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 处理自定义应用错误
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // 处理 Prisma 数据库错误
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = '数据已存在，违反唯一性约束';
        details = { field: error.meta?.target };
        break;
      case 'P2025':
        statusCode = 404;
        message = '请求的资源不存在';
        break;
      case 'P2003':
        statusCode = 400;
        message = '外键约束失败';
        break;
      default:
        statusCode = 400;
        message = '数据库操作失败';
    }
  }
  
  // 处理 Prisma 验证错误
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = '数据验证失败';
  }
  
  // 处理 JWT 错误
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的认证令牌';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '认证令牌已过期';
  }
  
  // 处理验证错误
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '请求数据验证失败';
    details = error.message;
  }

  // 记录错误日志
  console.error('错误详情:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined
    }
  });

  // 构建错误响应
  const errorResponse: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.url
  };

  // 开发环境下添加详细信息
  if (isDevelopment) {
    errorResponse.error = {
      name: error.name,
      stack: error.stack,
      details
    };
  } else if (details) {
    errorResponse.details = details;
  }

  res.status(statusCode).json(errorResponse);
};

// 异步错误捕获包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 错误处理
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `路由 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
};