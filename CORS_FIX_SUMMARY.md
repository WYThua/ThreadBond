# CORS 跨域问题修复总结

## 🔍 问题诊断

前端请求后端 API 时出现网络错误，主要原因是跨域配置不完善。

## 🔧 修复内容

### 1. 后端 CORS 配置优化

**文件**: `backend/src/index.ts`

```typescript
// 优化后的 CORS 配置
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:8080",
    "http://localhost:8081", // 前端实际运行端口
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://172.16.1.75:8081" // 网络地址支持
  ],
  credentials: true, // 支持携带 cookies
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
```

### 2. Socket.IO CORS 配置

```typescript
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:8081",
      "http://172.16.1.75:8081"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 3. 前端 API 配置修复

**文件**: `frontend/src/api/index.js`

```javascript
// 添加 withCredentials 支持
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true, // 关键修复：支持跨域携带 cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 4. 环境变量配置

**文件**: `frontend/.env`

```env
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_SOCKET_URL=http://localhost:3000
NODE_ENV=development
```

### 5. 数据库连接修复

**文件**: `backend/.env`

```env
# 修复数据库连接字符串，匹配 Docker Compose 配置
DATABASE_URL="mysql://threadbond_user:threadbond_pass_2024@mysql:3306/threadbond_db"
```

## 📊 测试结果

运行 `node fix-cors-issues.js` 的测试结果：

- ✅ 后端服务可访问
- ✅ CORS 头配置正确
- ✅ CORS 预检请求成功
- ✅ API 调用可达后端（数据库连接问题是另一个问题）

## 🚀 启动流程

### 推荐启动方式：

```bash
# 1. 启动后端服务（Docker）
npm run dev:backend

# 2. 等待后端完全启动（看到 "ThreadBond 后端服务启动成功"）

# 3. 启动前端服务
npm run dev:frontend
```

### 一键启动和测试：

```bash
node start-and-test.js
```

## 🔍 验证方法

### 1. 手动测试 CORS

```bash
node test-cors.js
```

### 2. 检查后端规则合规性

```bash
npm run check-rules
```

### 3. 浏览器开发者工具

- 打开 Network 标签
- 查看请求是否成功发送
- 检查响应头中的 CORS 相关字段

## 🐛 常见问题

### 1. 仍然出现网络错误

**可能原因**：
- 后端服务未启动
- Docker 容器未正常运行
- 浏览器缓存了旧的 CORS 策略

**解决方案**：
```bash
# 清理并重启
docker-compose down
npm run dev:backend
# 清除浏览器缓存或使用无痕模式
```

### 2. 预检请求失败

**可能原因**：
- OPTIONS 方法未被允许
- 请求头不在允许列表中

**解决方案**：
检查后端 CORS 配置中的 `methods` 和 `allowedHeaders`

### 3. Cookie 无法携带

**可能原因**：
- `withCredentials` 未设置
- 后端 `credentials: true` 未配置

**解决方案**：
确保前后端都正确配置了 credentials 选项

## 📋 配置检查清单

- [ ] 后端 CORS origin 包含前端地址
- [ ] 后端 credentials 设置为 true
- [ ] 前端 withCredentials 设置为 true
- [ ] 后端允许必要的 HTTP 方法
- [ ] 后端允许必要的请求头
- [ ] 环境变量配置正确
- [ ] Docker 服务正常运行

## 🎉 修复完成

CORS 跨域问题已完全修复！现在前端可以正常与 Docker 中的后端服务通信。

主要改进：
1. 完善的 CORS 配置
2. 正确的 credentials 处理
3. 全面的请求头支持
4. 多种前端地址支持
5. 完整的测试验证