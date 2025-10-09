#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🐳 使用 Docker 启动 ThreadBond 服务...\n');

async function checkDockerStatus() {
  console.log('🔍 检查 Docker 状态...');
  
  return new Promise((resolve) => {
    const dockerCheck = spawn('docker', ['--version'], { shell: true });
    
    dockerCheck.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Docker 已安装');
        resolve(true);
      } else {
        console.log('❌ Docker 未安装或未运行');
        resolve(false);
      }
    });
    
    dockerCheck.on('error', () => {
      console.log('❌ Docker 未安装或未运行');
      resolve(false);
    });
  });
}

async function startServices() {
  const dockerAvailable = await checkDockerStatus();
  
  if (!dockerAvailable) {
    console.log('\n📋 请先安装并启动 Docker Desktop');
    console.log('下载地址: https://www.docker.com/products/docker-desktop');
    return;
  }
  
  console.log('\n🚀 启动 Docker 服务...');
  
  // 停止现有容器（如果有）
  console.log('🛑 停止现有容器...');
  const stopProcess = spawn('docker-compose', ['down'], {
    stdio: 'pipe',
    shell: true
  });
  
  stopProcess.on('exit', () => {
    // 启动服务
    console.log('🐳 启动 Docker Compose 服务...');
    const startProcess = spawn('docker-compose', ['up', '--build'], {
      stdio: 'inherit',
      shell: true
    });
    
    startProcess.on('error', (error) => {
      console.error('❌ Docker Compose 启动失败:', error.message);
    });
    
    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止 Docker 服务...');
      const downProcess = spawn('docker-compose', ['down'], {
        stdio: 'inherit',
        shell: true
      });
      
      downProcess.on('exit', () => {
        console.log('✅ Docker 服务已停止');
        process.exit(0);
      });
    });
  });
}

// 创建仅启动后端的函数
async function startBackendOnly() {
  console.log('\n🔧 仅启动后端服务（MySQL + Redis + Backend）...');
  
  const services = ['mysql', 'redis', 'backend'];
  
  // 停止现有容器
  const stopProcess = spawn('docker-compose', ['down'], {
    stdio: 'pipe',
    shell: true
  });
  
  stopProcess.on('exit', () => {
    // 启动指定服务
    const startProcess = spawn('docker-compose', ['up', '--build', ...services], {
      stdio: 'inherit',
      shell: true
    });
    
    startProcess.on('error', (error) => {
      console.error('❌ 后端服务启动失败:', error.message);
    });
    
    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止后端服务...');
      const downProcess = spawn('docker-compose', ['down'], {
        stdio: 'inherit',
        shell: true
      });
      
      downProcess.on('exit', () => {
        console.log('✅ 后端服务已停止');
        process.exit(0);
      });
    });
  });
}

// 检查命令行参数
const args = process.argv.slice(2);
if (args.includes('--backend-only') || args.includes('-b')) {
  startBackendOnly();
} else {
  startServices();
}

// 显示帮助信息
if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📖 使用说明:');
  console.log('node start-with-docker.js          # 启动所有服务');
  console.log('node start-with-docker.js -b       # 仅启动后端服务');
  console.log('node start-with-docker.js --help   # 显示帮助');
  console.log('\n🌐 服务地址:');
  console.log('- 后端 API: http://localhost:3000');
  console.log('- 前端应用: http://localhost:8080');
  console.log('- MySQL: localhost:3307');
  console.log('- Redis: localhost:6379');
}