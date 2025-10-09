import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { setupPassport } from './config/passport';
import { connectRedis } from './config/redis';
import { setupSocketIO } from './config/socket';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import clueRoutes from './routes/clues';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';
import securityRoutes from './routes/security';
import recommendationRoutes from './routes/recommendations';

// 加载环境变量
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8080",
      "http://localhost:8081", // 添加 8081 端口支持
      "http://localhost:8083", // 添加 8083 端口支持
      "http://127.0.0.1:8080",
      "http://127.0.0.1:8081",
      "http://127.0.0.1:8083",
      "http://172.16.1.75:8081", // 添加网络地址支持
      "http://172.16.1.75:8083"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet()); // 安全头部
app.use(compression()); // 响应压缩
app.use(cors({
  origin: [
    "http://localhost:8080", // 确保 8080 端口在列表中
    "http://localhost:8081", 
    "http://localhost:8083", 
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8083",
    "http://172.16.1.75:8080", // 添加网络地址支持
    "http://172.16.1.75:8081",
    "http://172.16.1.75:8083"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200 // 支持旧版浏览器
}));
app.use(morgan('combined')); // 日志记录
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
app.use(rateLimiter);

// 初始化 Passport
setupPassport();
app.use(authMiddleware);

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clues', clueRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 根路径欢迎页面
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ThreadBond API 服务正在运行',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      clues: '/api/clues',
      chat: '/api/chat'
    },
    frontend: process.env.FRONTEND_URL || 'http://localhost:8080',
    timestamp: new Date().toISOString()
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use(errorHandler);

// 初始化服务
async function startServer() {
  try {
    // 暂时跳过 Redis 连接
    console.log('⚠️  跳过 Redis 连接（开发模式）');

    // 设置 Socket.IO
    setupSocketIO(io);
    console.log('✅ Socket.IO 初始化完成');

    // 启动服务器
    server.listen(PORT, () => {
      console.log(`🚀 ThreadBond 后端服务启动成功`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 启动服务
if (require.main === module) {
  startServer();
}

export default app;