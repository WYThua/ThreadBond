import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

// 初始化 Passport 中间件
export const authMiddleware = passport.initialize();

// JWT 认证中间件
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any): void => {
    if (err) {
      res.status(500).json({
        success: false,
        message: '认证过程中发生错误',
        error: err.message
      });
      return;
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: '未授权访问，请先登录',
        error: info?.message || '无效的认证令牌'
      });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};

// 可选认证中间件（用户可能已登录也可能未登录）
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any): void => {
    if (err) {
      console.error('可选认证错误:', err);
    }
    
    // 无论是否认证成功都继续，但将用户信息附加到请求
    req.user = user || null;
    next();
  })(req, res, next);
};

// 检查用户是否为管理员
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '需要管理员权限'
    });
    return;
  }

  // 这里可以添加管理员检查逻辑
  // 目前简化处理，后续可以添加角色系统
  next();
};

// 检查用户是否拥有特定资源的访问权限
export const checkResourceOwnership = (resourceType: 'clue' | 'chat' | 'message') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as any;
      if (!user) {
        res.status(401).json({
          success: false,
          message: '需要登录才能访问此资源'
        });
        return;
      }

      // 获取用户的匿名身份ID
      const anonymousIdentity = user.anonymousIdentities?.[0];
      if (!anonymousIdentity) {
        res.status(403).json({
          success: false,
          message: '用户没有匿名身份'
        });
        return;
      }

      // 将匿名身份ID附加到请求对象
      (req as any).anonymousId = anonymousIdentity.id;
      
      next();
    } catch (error) {
      console.error('资源权限检查失败:', error);
      res.status(500).json({
        success: false,
        message: '权限检查过程中发生错误'
      });
      return;
    }
  };
};