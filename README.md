# ThreadBond - 匿名线索社交应用

ThreadBond 是一款创新的匿名线索社交应用，通过独特的"解密"互动机制让用户能够在保持匿名的同时进行深度社交。用户可以创建充满悬念的线索卡供他人解密，也可以解密他人的线索卡来解锁匿名聊天功能。

## 🚨 重要开发规则

**后端服务必须在 Docker 容器中运行，严禁在本地直接运行任何后端相关服务！**

包括但不限于：
- Node.js 后端应用
- MySQL 数据库  
- Redis 缓存
- 其他后端依赖服务

违反此规则的操作将被阻止。请使用 `npm run check-rules` 检查合规性。

## 🚀 项目特色

- **匿名社交**: 完全匿名的社交体验，保护用户隐私
- **线索解密**: 独特的解密互动机制，增加社交趣味性
- **AI 辅助**: 集成 AI 技术提供线索生成和情绪分析
- **移动优先**: 专为移动设备优化的 PWA 应用
- **实时聊天**: 基于 Socket.IO 的实时消息传递
- **安全保护**: 端到端加密和完善的安全机制

## 🏗️ 技术架构

### 后端技术栈
- **Node.js 18+** - 运行时环境
- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **Prisma** - ORM 数据库操作
- **MySQL 8.0** - 主数据库
- **Redis** - 缓存和会话存储
- **Socket.IO** - 实时通信
- **Passport.js** - 身份认证
- **Docker** - 容器化部署

### 前端技术栈
- **Vue 2** - 前端框架
- **Vant UI** - 移动端 UI 组件库
- **Vuex** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **Socket.IO Client** - 实时通信客户端
- **PWA** - 渐进式 Web 应用

## 📦 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd threadbond-app
```

2. **配置环境变量**
```bash
# 后端环境配置
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件，填入实际配置

# 前端环境配置
cp frontend/.env.example frontend/.env
# 编辑 frontend/.env 文件，填入实际配置
```

3. **启动服务**
```bash
# 启动所有服务（推荐）
npm run dev

# 或者分别启动
npm run dev:backend  # 仅启动后端
npm run dev:frontend # 仅启动前端
```

4. **初始化数据库**
```bash
# 进入后端容器
docker exec -it threadbond-backend bash

# 运行数据库迁移
npm run prisma:migrate

# 运行种子数据
npm run prisma:seed
```

### 访问应用

- **前端应用**: http://localhost:8080
- **后端 API**: http://localhost:3000
- **API 文档**: http://localhost:3000/health
- **数据库管理**: `docker exec -it threadbond-mysql mysql -u threadbond_user -p`

## 🐳 Docker 部署

项目完全基于 Docker 容器化，所有后端相关的配置、编译和运行都在 Docker 中执行。

### 服务说明

- **threadbond-mysql**: MySQL 8.0 数据库服务
- **threadbond-redis**: Redis 缓存服务
- **threadbond-backend**: Node.js 后端服务
- **threadbond-frontend**: Vue.js 前端服务

### 常用命令

```bash
# 构建并启动所有服务
docker-compose up --build

# 后台运行
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看日志
docker-compose logs -f [service-name]

# 进入容器
docker exec -it [container-name] bash

# 清理所有数据和镜像
npm run clean
```

## 📁 项目结构

```
threadbond-app/
├── backend/                 # 后端服务
│   ├── src/                # 源代码
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 入口文件
│   ├── prisma/             # 数据库模式和迁移
│   ├── Dockerfile          # Docker 配置
│   └── package.json        # 依赖配置
├── frontend/               # 前端应用
│   ├── src/                # 源代码
│   │   ├── components/     # 组件
│   │   ├── views/          # 页面
│   │   ├── store/          # 状态管理
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   ├── styles/         # 样式文件
│   │   └── main.js         # 入口文件
│   ├── public/             # 静态资源
│   ├── Dockerfile          # Docker 配置
│   └── package.json        # 依赖配置
├── docker/                 # Docker 相关配置
│   └── mysql/              # MySQL 初始化脚本
├── docker-compose.yml      # Docker Compose 配置
└── package.json            # 项目根配置
```

## 🔧 开发指南

### 后端开发

1. **添加新的 API 路由**
   - 在 `backend/src/routes/` 中创建路由文件
   - 在 `backend/src/index.ts` 中注册路由

2. **数据库操作**
   - 修改 `backend/prisma/schema.prisma` 定义数据模型
   - 运行 `npm run prisma:migrate` 生成迁移
   - 运行 `npm run prisma:generate` 更新客户端

3. **添加中间件**
   - 在 `backend/src/middleware/` 中创建中间件
   - 在相应路由中使用

### 前端开发

1. **添加新页面**
   - 在 `frontend/src/views/` 中创建 Vue 组件
   - 在 `frontend/src/router/index.js` 中添加路由

2. **状态管理**
   - 在 `frontend/src/store/modules/` 中创建 Vuex 模块
   - 在 `frontend/src/store/index.js` 中注册模块

3. **样式开发**
   - 使用 Vant UI 组件库
   - 自定义样式放在 `frontend/src/styles/` 中

## 🧪 测试

### 后端测试
```bash
# 进入后端容器
docker exec -it threadbond-backend bash

# 运行单元测试
npm test

# 运行测试并监听变化
npm run test:watch
```

### 前端测试
```bash
# 进入前端容器
docker exec -it threadbond-frontend bash

# 运行单元测试
npm run test:unit
```

## 📚 API 文档

API 文档将在后续任务中完善，目前可以通过以下方式查看：

- 健康检查端点: `GET /health`
- 所有 API 路由都在 `/api` 前缀下

## 🔒 安全特性

- JWT 身份认证
- 速率限制
- 数据加密存储
- 输入验证和清理
- CORS 保护
- 安全头部设置

## 🌍 环境配置

### 开发环境
- 自动重载
- 详细错误信息
- 开发工具支持

### 生产环境
- 代码压缩
- 错误日志记录
- 性能监控
- 安全加固

## 📝 许可证

MIT License

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 支持

如有问题，请通过以下方式联系：

- 创建 Issue
- 发送邮件至项目维护者

---

**注意**: 这是项目的基础架构搭建阶段，具体的业务功能将在后续任务中逐步实现。