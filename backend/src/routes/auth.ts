import { Router } from 'express';
import { authLimiter, registerLimiter } from '@/middleware/rateLimiter';

const router = Router();

// 用户注册
router.post('/register', registerLimiter, (req, res) => {
  res.json({
    success: true,
    message: '注册功能待实现',
    data: null
  });
});

// 用户登录
router.post('/login', authLimiter, (req, res) => {
  res.json({
    success: true,
    message: '登录功能待实现',
    data: null
  });
});

// 用户登出
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: '登出功能待实现',
    data: null
  });
});

// 刷新令牌
router.post('/refresh', (req, res) => {
  res.json({
    success: true,
    message: '令牌刷新功能待实现',
    data: null
  });
});

export default router;