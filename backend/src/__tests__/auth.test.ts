import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('用户认证 API', () => {
  beforeAll(async () => {
    // 测试前清理数据库
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // 测试后清理数据库
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('注册成功');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('anonymousIdentity');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.anonymousIdentity).toHaveProperty('displayName');
    });

    it('应该拒绝重复的邮箱注册', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('该邮箱已被注册');
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('请输入有效的邮箱地址');
    });

    it('应该拒绝弱密码', async () => {
      const userData = {
        email: 'test2@example.com',
        password: '123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('密码');
    });

    it('应该拒绝缺少必填字段', async () => {
      const userData = {
        email: 'test3@example.com'
        // 缺少 password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('密码不能为空');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // 创建测试用户
      const userData = {
        email: 'login-test@example.com',
        password: 'Test123!@#'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('应该成功登录有效用户', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('anonymousIdentity');
    });

    it('应该拒绝错误的密码', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'WrongPassword123!@#'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户不存在或已被禁用');
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('请输入有效的邮箱地址');
    });
  });

  describe('POST /api/auth/check-email', () => {
    it('应该返回邮箱可用状态', async () => {
      const response = await request(app)
        .post('/api/auth/check-email')
        .send({ email: 'available@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('available');
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const response = await request(app)
        .post('/api/auth/check-email')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('邮箱格式不正确');
    });

    it('应该拒绝空邮箱', async () => {
      const response = await request(app)
        .post('/api/auth/check-email')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('邮箱地址不能为空');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('应该成功登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登出成功');
    });
  });
});