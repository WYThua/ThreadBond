# ThreadBond Docker 启动指南

## 🚨 重要规则

**后端服务必须在 Docker 容器中运行，严禁在本地直接运行任何后端相关服务！**

## 🐳 启动方式

### 1. 完整启动（所有服务）

```bash
# 启动所有服务（推荐）
npm run dev

# 或者直接使用 docker-compose
docker-compose up --build
```

### 2. 仅启动后端服务

```bash
# 启动后端相关服务（MySQL + Redis + Backend）
npm run dev:backend

# 或者
docker-compose up --build mysql redis backend
```

### 3. 前端开发模式

```bash
# 1. 先启动后端服务
npm run dev:backend

# 2. 在另一个终端启动前端
node start-frontend-only.js
# 或者
cd frontend && npm run serve
```

## 📋 服务说明

### Docker 服务：
- **MySQL**: 数据库服务 (端口 3307)
- **Redis**: 缓存服务 (端口 6379)  
- **Backend**: Node.js API 服务 (端口 3000)
- **Frontend**: Vue.js 应用 (端口 8081) - 可选

### 本地服务：
- **Frontend**: 仅前端可以在本地运行用于开发

## 🌐 访问地址

- **前端应用**: http://localhost:8081
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

## 🔧 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs backend
docker-compose logs mysql
docker-compose logs redis

# 停止所有服务
npm run stop
# 或者
docker-compose down

# 完全清理（删除容器、镜像、数据卷）
npm run clean
# 或者
docker-compose down -v --rmi all

# 重新构建
npm run build
# 或者
docker-compose build --no-cache
```

## 🐛 故障排除

### 1. Docker Desktop 未启动
```bash
# 检查 Docker 状态
docker --version
docker-compose --version
```

### 2. 端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3307
netstat -ano | findstr :6379

# 停止现有容器
docker-compose down
```

### 3. 容器启动失败
```bash
# 查看详细日志
docker-compose logs

# 重新构建容器
docker-compose build --no-cache
docker-compose up --force-recreate
```

### 4. 数据库连接问题
```bash
# 检查 MySQL 容器状态
docker-compose logs mysql

# 进入 MySQL 容器
docker-compose exec mysql mysql -u threadbond_user -p threadbond_db
```

## ⚠️ 禁止操作

以下操作严格禁止：

```bash
# ❌ 禁止在本地运行后端
cd backend && npm run dev
node backend/src/index.js

# ❌ 禁止本地安装数据库
brew install mysql
apt-get install mysql-server

# ❌ 禁止本地安装 Redis
brew install redis
apt-get install redis-server

# ❌ 禁止直接连接本地数据库
mysql -u root -p
```

## ✅ 正确的开发流程

1. **启动 Docker 后端服务**
   ```bash
   npm run dev:backend
   ```

2. **等待服务完全启动**
   - 查看日志确认 MySQL 就绪
   - 查看日志确认 Redis 连接成功
   - 查看日志确认后端 API 启动

3. **启动前端开发服务器**
   ```bash
   node start-frontend-only.js
   ```

4. **开始开发**
   - 前端代码修改会自动热重载
   - 后端代码修改需要重启 Docker 容器

## 🔄 开发工作流

### 前端开发
- 修改前端代码 → 自动热重载 ✅
- 无需重启任何服务

### 后端开发  
- 修改后端代码 → 重启 Docker 容器
```bash
docker-compose restart backend
```

### 数据库修改
- 修改数据库结构 → 重新构建并启动
```bash
docker-compose down
docker-compose up --build mysql backend
```

## 📊 性能建议

1. **分配足够内存给 Docker Desktop**
   - 推荐至少 4GB RAM
   - 在 Docker Desktop 设置中调整

2. **使用 SSD 存储**
   - Docker 容器和数据卷建议存储在 SSD 上

3. **定期清理**
   ```bash
   # 清理未使用的镜像和容器
   docker system prune -a
   ```

这个指南确保所有后端相关服务都在 Docker 中运行，符合项目规则要求。