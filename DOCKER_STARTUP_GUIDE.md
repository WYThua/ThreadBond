# Docker Desktop 启动指南

## 🚨 当前问题

Docker Desktop 未运行，导致无法启动后端服务。

## 🔧 解决步骤

### 步骤 1: 启动 Docker Desktop

#### 方法 A: 自动启动（推荐）
```bash
node start-docker-desktop.js
```

#### 方法 B: 手动启动
1. 按 `Win + R` 打开运行对话框
2. 输入 `Docker Desktop` 并按回车
3. 等待 Docker Desktop 完全启动（状态显示为绿色）

#### 方法 C: 从开始菜单启动
1. 点击开始菜单
2. 搜索 "Docker Desktop"
3. 点击启动应用程序

### 步骤 2: 验证 Docker 状态

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker 信息
docker info

# 运行诊断脚本
node fix-docker-issues.js
```

### 步骤 3: 启动后端服务

Docker Desktop 启动成功后：

```bash
# 启动后端服务
npm run dev:backend

# 或者使用完整启动
npm run dev
```

## 🐛 常见问题

### 问题 1: Docker Desktop 启动失败

**可能原因**:
- 系统资源不足
- Hyper-V 或 WSL 2 未启用
- 权限问题

**解决方案**:
```bash
# 1. 以管理员身份运行 PowerShell
# 2. 启用 Hyper-V（如果使用 Hyper-V 后端）
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# 3. 或启用 WSL 2（推荐）
wsl --install
```

### 问题 2: Docker 启动但无法连接

**解决方案**:
1. 重启 Docker Desktop
2. 检查防火墙设置
3. 重置 Docker Desktop 到出厂设置

### 问题 3: 镜像拉取失败

**解决方案**:
```bash
# 配置镜像加速器（中国用户）
# 在 Docker Desktop 设置中添加镜像源：
# https://registry.docker-cn.com
# https://docker.mirrors.ustc.edu.cn
```

## 🔄 重置 Docker Desktop

如果遇到严重问题：

1. 打开 Docker Desktop
2. 点击设置图标（齿轮）
3. 选择 "Troubleshoot"
4. 点击 "Reset to factory defaults"
5. 确认重置
6. 重新启动 Docker Desktop

## 📊 系统要求检查

### Windows 系统要求:
- Windows 10 64-bit: Pro, Enterprise, or Education (Build 15063 或更高)
- 或 Windows 11 64-bit: Home, Pro, Enterprise, or Education
- 启用 Hyper-V 和容器 Windows 功能
- 或启用 WSL 2 功能

### 硬件要求:
- 64 位处理器，支持二级地址转换 (SLAT)
- 4GB 系统 RAM
- 在 BIOS 设置中启用硬件虚拟化

## 🚀 验证安装

运行以下命令验证 Docker 安装：

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker-compose --version

# 运行测试容器
docker run hello-world

# 检查 Docker 系统信息
docker system info
```

## 📋 启动检查清单

- [ ] Docker Desktop 已安装
- [ ] Docker Desktop 正在运行（状态为绿色）
- [ ] `docker --version` 命令正常工作
- [ ] `docker info` 命令正常工作
- [ ] 可以拉取镜像（`docker pull hello-world`）
- [ ] 可以运行容器（`docker run hello-world`）

## 🎯 下一步

Docker Desktop 正常运行后：

1. **启动后端服务**:
   ```bash
   npm run dev:backend
   ```

2. **启动前端服务**:
   ```bash
   npm run dev:frontend
   ```

3. **验证服务**:
   - 后端: http://localhost:3000/health
   - 前端: http://localhost:8081

## 📞 获取帮助

如果仍有问题：

1. 查看 Docker Desktop 日志
2. 运行 `node fix-docker-issues.js` 获取详细诊断
3. 检查 Docker Desktop 官方文档
4. 重启计算机后重试

---

**重要提醒**: 根据项目规则，后端服务必须在 Docker 中运行，不允许在本地直接运行。