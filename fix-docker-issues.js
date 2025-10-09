#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🐳 Docker 问题诊断和修复...\n');

async function checkDockerDesktop() {
  console.log('1. 检查 Docker Desktop 状态...');
  
  return new Promise((resolve) => {
    exec('docker --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Docker 未安装');
        console.log('请从以下地址下载并安装 Docker Desktop:');
        console.log('https://www.docker.com/products/docker-desktop');
        resolve(false);
      } else {
        console.log('✅ Docker 已安装:', stdout.trim());
        
        // 检查 Docker 守护进程是否运行
        exec('docker info', (infoError, infoStdout) => {
          if (infoError) {
            console.log('❌ Docker Desktop 未运行');
            console.log('请启动 Docker Desktop 应用程序');
            resolve(false);
          } else {
            console.log('✅ Docker Desktop 正在运行');
            resolve(true);
          }
        });
      }
    });
  });
}

async function checkDockerCompose() {
  console.log('\n2. 检查 Docker Compose...');
  
  return new Promise((resolve) => {
    exec('docker-compose --version', (error, stdout) => {
      if (error) {
        console.log('❌ Docker Compose 不可用');
        resolve(false);
      } else {
        console.log('✅ Docker Compose 可用:', stdout.trim());
        resolve(true);
      }
    });
  });
}

async function cleanupDockerResources() {
  console.log('\n3. 清理 Docker 资源...');
  
  return new Promise((resolve) => {
    // 停止所有相关容器
    exec('docker-compose down', (error, stdout, stderr) => {
      if (stdout) console.log('停止容器:', stdout.trim());
      if (stderr && !stderr.includes('No such file')) {
        console.log('清理信息:', stderr.trim());
      }
      
      // 清理悬空镜像
      exec('docker image prune -f', (pruneError, pruneStdout) => {
        if (pruneStdout) console.log('清理镜像:', pruneStdout.trim());
        
        console.log('✅ Docker 资源清理完成');
        resolve();
      });
    });
  });
}

async function pullRequiredImages() {
  console.log('\n4. 拉取必需的镜像...');
  
  const images = [
    'mysql:8.0',
    'redis:7-alpine',
    'node:18-slim'
  ];
  
  for (const image of images) {
    console.log(`📥 拉取镜像: ${image}`);
    
    await new Promise((resolve) => {
      const pullProcess = spawn('docker', ['pull', image], {
        stdio: 'pipe',
        shell: true
      });
      
      pullProcess.stdout.on('data', (data) => {
        process.stdout.write('.');
      });
      
      pullProcess.on('exit', (code) => {
        if (code === 0) {
          console.log(`\n✅ ${image} 拉取成功`);
        } else {
          console.log(`\n❌ ${image} 拉取失败`);
        }
        resolve();
      });
      
      pullProcess.on('error', (error) => {
        console.log(`\n❌ ${image} 拉取错误:`, error.message);
        resolve();
      });
    });
  }
}

async function testDockerCompose() {
  console.log('\n5. 测试 Docker Compose 配置...');
  
  return new Promise((resolve) => {
    exec('docker-compose config', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Docker Compose 配置有误:', error.message);
        resolve(false);
      } else {
        console.log('✅ Docker Compose 配置正确');
        resolve(true);
      }
    });
  });
}

async function createAlternativeDockerCompose() {
  console.log('\n6. 创建简化的 Docker Compose 配置...');
  
  const fs = require('fs');
  
  const simplifiedCompose = `# 简化的 Docker Compose 配置
version: '3.8'

services:
  # MySQL 数据库服务
  mysql:
    image: mysql:8.0
    container_name: threadbond-mysql-simple
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: threadbond_root_2024
      MYSQL_DATABASE: threadbond_db
      MYSQL_USER: threadbond_user
      MYSQL_PASSWORD: threadbond_pass_2024
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  # Redis 缓存服务
  redis:
    image: redis:7-alpine
    container_name: threadbond-redis-simple
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 后端 Node.js 服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: threadbond-backend-simple
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: mysql://threadbond_user:threadbond_pass_2024@mysql:3306/threadbond_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: threadbond_jwt_secret_key_2024_very_secure
      PORT: 3000
      FRONTEND_URL: http://localhost:8081
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mysql
      - redis
    command: npm run dev

volumes:
  mysql_data:
  redis_data:
`;

  fs.writeFileSync('docker-compose.simple.yml', simplifiedCompose);
  console.log('✅ 创建简化配置: docker-compose.simple.yml');
}

async function provideSolutions() {
  console.log('\n📋 Docker 问题解决方案:\n');
  
  console.log('🔧 方案 1: 重启 Docker Desktop');
  console.log('1. 完全退出 Docker Desktop');
  console.log('2. 以管理员身份重新启动 Docker Desktop');
  console.log('3. 等待 Docker 完全启动（状态显示为绿色）');
  
  console.log('\n🔧 方案 2: 重置 Docker Desktop');
  console.log('1. 打开 Docker Desktop 设置');
  console.log('2. 选择 "Troubleshoot" 或"故障排除"');
  console.log('3. 点击 "Reset to factory defaults"');
  console.log('4. 重新启动 Docker Desktop');
  
  console.log('\n🔧 方案 3: 使用简化配置');
  console.log('docker-compose -f docker-compose.simple.yml up --build mysql redis backend');
  
  console.log('\n🔧 方案 4: 手动启动服务');
  console.log('1. docker pull mysql:8.0');
  console.log('2. docker pull redis:7-alpine');
  console.log('3. docker run -d --name mysql-temp -p 3307:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0');
  console.log('4. docker run -d --name redis-temp -p 6379:6379 redis:7-alpine');
  
  console.log('\n🔧 方案 5: 检查系统要求');
  console.log('- 确保 Windows 版本支持 Docker Desktop');
  console.log('- 启用 Hyper-V 或 WSL 2');
  console.log('- 确保有足够的内存（至少 4GB）');
}

async function main() {
  const dockerInstalled = await checkDockerDesktop();
  
  if (!dockerInstalled) {
    await provideSolutions();
    return;
  }
  
  const composeWorking = await checkDockerCompose();
  
  if (composeWorking) {
    await cleanupDockerResources();
    
    const configValid = await testDockerCompose();
    
    if (configValid) {
      console.log('\n🎯 尝试拉取镜像...');
      await pullRequiredImages();
    }
    
    await createAlternativeDockerCompose();
  }
  
  await provideSolutions();
  
  console.log('\n🎉 Docker 诊断完成！');
  console.log('\n🚀 建议的启动命令:');
  console.log('1. 标准启动: docker-compose up --build mysql redis backend');
  console.log('2. 简化启动: docker-compose -f docker-compose.simple.yml up --build');
  console.log('3. 分步启动: 先启动 Docker Desktop，然后运行上述命令');
}

main().catch(console.error);