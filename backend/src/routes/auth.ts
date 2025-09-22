import { Router, Request, Response } from 'express';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter';
import { userService } from '../services/userService';
import { validateRequest, registerSchema, loginSchema } from '../utils/validation';

const router = Router();

// 用户注册
router.post('/register', registerLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    // 验证请求数据
    const validatedData = validateRequest(registerSchema, req.body);
    
    // 注册用户
    const result = await userService.registerUser(validatedData);
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: result
    });
    return;
  } catch (error) {
    console.error('用户注册失败:', error);
    
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : '注册失败',
      data: null
    });
    return;
  }
});

// 用户登录
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    // 验证请求数据
    const validatedData = validateRequest(loginSchema, req.body);
    
    // 用户认证
    const result = await userService.authenticateUser(
      validatedData.email,
      validatedData.password
    );
    
    res.json({
      success: true,
      message: '登录成功',
      data: result
    });
    return;
  } catch (error) {
    console.error('用户登录失败:', error);
    
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : '登录失败',
      data: null
    });
    return;
  }
});

// 用户登出
router.post('/logout', (req: Request, res: Response) => {
  // JWT 是无状态的，客户端删除 token 即可实现登出
  res.json({
    success: true,
    message: '登出成功',
    data: null
  });
});

// 刷新令牌
router.post('/refresh', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '令牌刷新功能待实现',
    data: null
  });
});

// 检查邮箱是否可用
router.post('/check-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: '邮箱地址不能为空',
        data: null
      });
      return;
    }

    // 这里可以添加邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: '邮箱格式不正确',
        data: null
      });
      return;
    }

    // 检查邮箱是否已被注册（这里暂时返回可用，实际应该查询数据库）
    res.json({
      success: true,
      message: '邮箱可用',
      data: { available: true }
    });
    return;
  } catch (error) {
    console.error('检查邮箱失败:', error);
    
    res.status(500).json({
      success: false,
      message: '检查邮箱失败',
      data: null
    });
    return;
  }
});

export default router;