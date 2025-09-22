// Jest 测试设置文件
import { PrismaClient } from '@prisma/client';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://threadbond_user:threadbond_pass_2024@localhost:3306/threadbond_test_db';
process.env.JWT_SECRET = 'test_jwt_secret';

// 全局测试超时
jest.setTimeout(30000);

// 全局 Prisma 客户端清理
afterAll(async () => {
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});