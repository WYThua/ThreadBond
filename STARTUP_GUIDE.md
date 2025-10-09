# ThreadBond 启动指南

## 🚀 启动方式选择

**重要：后端服务必须在 Docker 容器中运行，不允许在本地直接运行。**

### 方式一：完整 Docker 启动（推荐用于生产环境）

```bash
# 启动所有服务（包括数据库）
node start-with-docker.js
```

**优点**：
- 环境一致性好
- 包含完整的数据库和缓存
- 接近生产环境

**缺点**：
- 需要 Docker Desktop
- 启动较慢
- 资源占用较高

### 方式二：混合启动（推荐用于前端开发）

```bash
# Docker 运行后端，本地运行前端
node start-hybrid.js
```

**优点**：
- 前端热重载快
- 后端环境稳定
- 开发体验好

**缺点**：
- 需要 Docker Desktop
- 配置相对复杂

### 方式三：仅后端 Docker 启动

```bash
# 仅启动后端服务
node start-with-docker.js --backend-only
```

然后在另一个终端启动前端：

```bash
cd frontend
npm run serve
```

## 📋 前置条件

### 必需条件：
- Node.js 18+（仅用于前端）
- npm 或 yarn
- Docker Desktop
- 至少 4GB 可用内存

### 禁止在本地安装：
- MySQL（必须使用 Docker）
- Redis（必须使用 Docker）
- 不允许直接运行后端 Node.js 服务

## 🔧 环境配置

### 1. 后端环境变量

创建 `backend/.env` 文件：

```env
# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/threadbond"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis 配置（可选）
REDIS_URL="redis://localhost:6379"

# 服务器配置
PORT=3000
NODE_ENV=development

# 前端 URL
FRONTEND_URL="http://localhost:8081"
```

### 2. 前端环境变量

创建 `frontend/.env` 文件：

```env
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_SOCKET_URL=http://localhost:3000
```

## 🌐 服务地址

启动成功后，可以访问以下地址：

- **前端应用**: http://localhost:8081
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health
- **API 文档**: http://localhost:3000/api-docs（如果配置了）

## 🐛 常见问题

### 1. 端口被占用

```bash
# 清理端口 3000
node kill-port-3000.js

# 或手动查找并终止进程
netstat -ano | findstr :3000
taskkill /f /pid <PID>
```

### 2. Docker 连接失败

```bash
# 检查 Docker Desktop 是否运行
docker --version

# 重启 Docker Desktop
# 或在 Docker Desktop 设置中重置
```

### 3. 数据库连接失败

```bash
# 检查 MySQL 是否运行
mysql -u root -p

# 创建数据库
CREATE DATABASE threadbond;
```

### 4. 前端网络错误

```bash
# 测试后端连接
node fix-network-connection.js

# 检查 API 配置
cat frontend/src/api/index.js
```

## 🔄 重启服务

### 完全重启
```bash
# 停止所有 Node.js 进程
taskkill /f /im node.exe

# 停止 Docker 容器
docker-compose down

# 重新启动
node start-local-only.js
```

### 仅重启前端
```bash
# 在前端目录
cd frontend
npm run serve
```

### 仅重启后端
```bash
# 在后端目录
cd backend
npm run dev
```

## 📊 性能优化

### 开发环境
- 使用本地启动方式
- 禁用不必要的中间件
- 使用热重载

### 生产环境
- 使用 Docker 启动
- 启用 Redis 缓存
- 配置反向代理

## 🆘 获取帮助

如果遇到问题：

1. 查看控制台错误信息
2. 检查服务状态：`node fix-network-connection.js`
3. 查看日志文件
4. 重启相关服务

## 📝 开发建议

1. **前端开发**：使用混合启动模式
2. **后端开发**：使用本地启动模式
3. **全栈开发**：使用本地启动模式
4. **测试部署**：使用 Docker 启动模式