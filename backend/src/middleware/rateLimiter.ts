import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// 通用速率限制
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // 如果用户已登录，使用用户ID，否则使用IP
    const user = req.user as any;
    return user?.id || req.ip;
  }
});

// 认证相关的严格速率限制
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次认证尝试
  message: {
    success: false,
    message: '登录尝试过于频繁，请15分钟后再试',
    retryAfter: '15分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // 成功的请求不计入限制
});

// 注册速率限制
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每个IP每小时最多3次注册尝试
  message: {
    success: false,
    message: '注册尝试过于频繁，请1小时后再试',
    retryAfter: '1小时'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 解密尝试速率限制
export const decryptionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 10, // 每个用户5分钟内最多10次解密尝试
  message: {
    success: false,
    message: '解密尝试过于频繁，请稍后再试',
    retryAfter: '5分钟'
  },
  keyGenerator: (req: Request) => {
    const user = req.user as any;
    return user?.id || req.ip;
  }
});

// 消息发送速率限制
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 30, // 每个用户每分钟最多30条消息
  message: {
    success: false,
    message: '消息发送过于频繁，请稍后再试',
    retryAfter: '1分钟'
  },
  keyGenerator: (req: Request) => {
    const user = req.user as any;
    return user?.id || req.ip;
  }
});

// 线索创建速率限制
export const clueCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每个用户每小时最多创建10个线索
  message: {
    success: false,
    message: '线索创建过于频繁，请1小时后再试',
    retryAfter: '1小时'
  },
  keyGenerator: (req: Request) => {
    const user = req.user as any;
    return user?.id || req.ip;
  }
});

// AI 服务调用速率限制
export const aiServiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 每个用户每小时最多50次AI服务调用
  message: {
    success: false,
    message: 'AI服务调用过于频繁，请1小时后再试',
    retryAfter: '1小时'
  },
  keyGenerator: (req: Request) => {
    const user = req.user as any;
    return user?.id || req.ip;
  }
});