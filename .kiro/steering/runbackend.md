---
inclusion: always
---

# 后端运行规则

## 强制性规则

**后端服务必须在 Docker 容器中运行，不允许在本地直接运行任何后端相关的服务。**

### 包括但不限于：

1. **Node.js 后端应用**

   - 不允许使用 `npm run dev` 在本地启动
   - 不允许使用 `node` 命令直接运行后端代码
   - 必须通过 Docker Compose 启动

2. **数据库服务**

   - MySQL 必须在 Docker 容器中运行
   - 不允许在本地安装和运行 MySQL

3. **缓存服务**

   - Redis 必须在 Docker 容器中运行
   - 不允许在本地安装和运行 Redis

4. **其他后端依赖**
   - 所有后端相关的服务都必须容器化
   - 包括消息队列、搜索引擎等

### 允许的运行方式：

1. **完整 Docker 启动**

   ```bash
   docker-compose up --build
   ```

2. **仅后端服务启动**

   ```bash
   docker-compose up --build mysql redis backend
   ```

3. **使用启动脚本**
   ```bash
   node start-with-docker.js
   node start-with-docker.js --backend-only
   ```

### 前端例外：

- 前端 Vue.js 应用可以在本地运行
- 前端开发服务器可以使用 `npm run serve`
- 前端构建工具可以在本地使用

### 开发流程：

1. 启动 Docker 后端服务
2. 在本地启动前端开发服务器
3. 前端通过 API 连接到 Docker 中的后端

### 违规检查：

任何尝试在本地运行后端服务的操作都应该被阻止或警告，包括：

- `cd backend && npm run dev`
- `node backend/src/index.js`
- 本地安装 MySQL/Redis
- 直接连接本地数据库

### 配置要求：

- 所有后端配置必须适配 Docker 环境
- 环境变量必须在 docker-compose.yml 中定义
- 网络配置必须使用 Docker 网络
- 数据持久化必须使用 Docker volumes
