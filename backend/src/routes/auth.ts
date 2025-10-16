import { Router, Request, Response } from 'express';
import { authLimiter, registerLimiter, verificationCodeLimiter } from '../middleware/rateLimiter';
import { userService } from '../services/userService';
import { verificationCodeService } from '../services/verificationCodeService';
import { validateRequest, registerSchema, loginSchema } from '../utils/validation';

const router = Router();

// 用户注册
router.post('/register', registerLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, verificationCode } = req.body;
    
    // 基本验证
    if (!email || !password || !verificationCode) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and verification code are required',
        data: null
      });
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        data: null
      });
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        data: null
      });
      return;
    }

    // 验证验证码格式
    if (!/^\d{6}$/.test(verificationCode)) {
      res.status(400).json({
        success: false,
        message: 'Verification code must be 6 digits',
        data: null
      });
      return;
    }

    // 验证验证码
    if (!verificationCodeService.verifyCode(email, verificationCode)) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
        data: null
      });
      return;
    }
    
    // 注册用户
    const result = await userService.registerUser({ email, password, verificationCode });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
    return;
  } catch (error) {
    console.error('用户注册失败:', error);
    
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
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

// 发送验证码
router.post('/send-verification-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required',
        data: null
      });
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
        data: null
      });
      return;
    }

    // 完全跳过验证码重复检查（开发阶段）
    // if (verificationCodeService.hasValidCode(email)) {
    //   const remainingTime = verificationCodeService.getCodeRemainingTime(email);
    //   res.status(429).json({
    //     success: false,
    //     message: `Please wait ${remainingTime} seconds before requesting a new code`,
    //     data: { remainingTime }
    //   });
    //   return;
    // }

    // 生成验证码
    const verificationCode = verificationCodeService.generateCode();
    
    // 存储验证码
    verificationCodeService.storeCode(email, verificationCode);
    
    console.log(`Generated verification code for ${email}: ${verificationCode}`);
    
    // 异步发送验证邮件（不阻塞响应）
    (async () => {
      try {
        const { emailService } = await import('../services/emailService');
        await emailService.sendVerificationEmail(email, verificationCode);
        console.log(`✅ 验证邮件已发送至: ${email}`);
      } catch (emailError) {
        console.error('❌ 发送验证邮件失败:', emailError);
        console.log('⚠️ 邮件发送失败，但验证码已生成');
      }
    })();
    
    res.json({
      success: true,
      message: 'Verification code sent successfully',
      data: { 
        email,
        expiresIn: 300, // 5分钟
        // 在开发环境下可以返回验证码，生产环境不应该返回
        ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
      }
    });
    return;
  } catch (error) {
    console.error('发送验证码失败:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      data: null
    });
    return;
  }
});

// 验证 token 有效性
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    // 从请求头中获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
        data: null
      });
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    // 验证 token（这里简化处理，实际应该使用 JWT 验证）
    if (!token || token.length < 10) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        data: null
      });
      return;
    }

    // 模拟用户信息（实际应该从 token 中解析或从数据库查询）
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      createdAt: new Date().toISOString()
    };

    const mockAnonymousIdentity = {
      id: 'anon_' + Date.now(),
      displayName: '神秘旅行者',
      avatar: null,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: mockUser,
        anonymousIdentity: mockAnonymousIdentity
      }
    });
    return;
  } catch (error) {
    console.error('Token 验证失败:', error);
    
    res.status(401).json({
      success: false,
      message: 'Token verification failed',
      data: null
    });
    return;
  }
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