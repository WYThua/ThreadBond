#!/usr/bin/env node

const { spawn, exec } = require('child_process');

console.log('🐳 启动 Docker Desktop...\n');

async function findDockerDesktop() {
  console.log('🔍 查找 Docker Desktop 安装路径...');
  
  const possiblePaths = [
    'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
    'C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe',
    '%LOCALAPPDATA%\\Programs\\Docker\\Docker\\Docker Desktop.exe',
    '%PROGRAMFILES%\\Docker\\Docker\\Docker Desktop.exe'
  ];
  
  const fs = require('fs');
  
  for (const dockerPath of possiblePaths) {
    const expandedPath = dockerPath.replace(/%([^%]+)%/g, (_, envVar) => {
      return process.env[envVar] || '';
    });
    
    if (fs.existsSync(expandedPath)) {
      console.log('✅ 找到 Docker Desktop:', expandedPath);
      return expandedPath;
    }
  }
  
  console.log('❌ 未找到 Docker Desktop 安装路径');
  return null;
}

async function startDockerDesktop() {
  const dockerPath = await findDockerDesktop();
  
  if (!dockerPath) {
    console.log('\n📋 手动启动 Docker Desktop:');
    console.log('1. 按 Win + R 打开运行对话框');
    console.log('2. 输入: "Docker Desktop"');
    console.log('3. 按回车键启动');
    console.log('4. 等待 Docker Desktop 完全启动（状态显示为绿色）');
    return false;
  }
  
  console.log('\n🚀 正在启动 Docker Desktop...');
  
  return new Promise((resolve) => {
    const startProcess = spawn(dockerPath, [], {
      detached: true,
      stdio: 'ignore'
    });
    
    startProcess.unref();
    
    console.log('✅ Docker Desktop 启动命令已执行');
    console.log('⏳ 请等待 Docker Desktop 完全启动...');
    
    // 等待 Docker 启动
    let attempts = 0;
    const maxAttempts = 30; // 最多等待 5 分钟
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      exec('docker info', (error) => {
        if (!error) {
          clearInterval(checkInterval);
          console.log('🎉 Docker Desktop 启动成功！');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.log('⏰ Docker Desktop 启动超时');
          console.log('请手动检查 Docker Desktop 是否正常启动');
          resolve(false);
        } else {
          process.stdout.write('.');
        }
      });
    }, 10000); // 每 10 秒检查一次
  });
}

async function waitForDockerReady() {
  console.log('\n⏳ 等待 Docker 服务完全就绪...');
  
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkReady = () => {
      attempts++;
      
      exec('docker version', (error, stdout) => {
        if (!error && stdout.includes('Server:')) {
          console.log('✅ Docker 服务完全就绪');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          console.log('⏰ 等待 Docker 就绪超时');
          resolve(false);
        } else {
          console.log(`检查 Docker 状态... (${attempts}/${maxAttempts})`);
          setTimeout(checkReady, 5000);
        }
      });
    };
    
    checkReady();
  });
}

async function testDockerConnection() {
  console.log('\n🔍 测试 Docker 连接...');
  
  return new Promise((resolve) => {
    exec('docker run --rm hello-world', (error, stdout) => {
      if (error) {
        console.log('❌ Docker 连接测试失败:', error.message);
        resolve(false);
      } else {
        console.log('✅ Docker 连接测试成功');
        resolve(true);
      }
    });
  });
}

async function main() {
  // 首先检查 Docker 是否已经在运行
  exec('docker info', async (error) => {
    if (!error) {
      console.log('✅ Docker Desktop 已经在运行');
      
      const connectionOk = await testDockerConnection();
      if (connectionOk) {
        console.log('\n🎉 Docker 环境就绪！');
        console.log('现在可以运行: npm run dev:backend');
      }
      return;
    }
    
    // Docker 未运行，尝试启动
    const started = await startDockerDesktop();
    
    if (started) {
      const ready = await waitForDockerReady();
      
      if (ready) {
        const connectionOk = await testDockerConnection();
        
        if (connectionOk) {
          console.log('\n🎉 Docker 环境完全就绪！');
          console.log('现在可以运行: npm run dev:backend');
        } else {
          console.log('\n⚠️  Docker 启动了但连接有问题');
          console.log('请尝试重启 Docker Desktop');
        }
      }
    } else {
      console.log('\n❌ Docker Desktop 启动失败');
      console.log('\n📋 手动解决步骤:');
      console.log('1. 手动启动 Docker Desktop 应用程序');
      console.log('2. 等待状态显示为绿色');
      console.log('3. 运行: node fix-docker-issues.js 重新检查');
    }
  });
}

main().catch(console.error);