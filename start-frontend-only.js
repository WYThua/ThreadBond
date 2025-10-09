#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎨 启动前端开发服务器...\n');

console.log('⚠️  重要提醒：');
console.log('   后端服务必须在 Docker 中运行！');
console.log('   请先运行: node start-with-docker.js --backend-only');
console.log('   或者: docker-compose up mysql redis backend\n');

// 检查后端是否在运行
async function checkBackend() {
  try {
    const axios = require('axios');
    await axios.get('http://localhost:3000/health', { timeout: 3000 });
    console.log('✅ 检测到后端服务正在运行');
    return true;
  } catch (error) {
    console.log('❌ 未检测到后端服务');
    console.log('   请先启动 Docker 后端服务');
    return false;
  }
}

async function startFrontend() {
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.log('\n📋 启动后端服务的命令：');
    console.log('   node start-with-docker.js --backend-only');
    console.log('   或者: docker-compose up mysql redis backend');
    console.log('\n是否仍要启动前端？(y/N)');
    
    // 简单的用户确认（在实际环境中可能需要更复杂的输入处理）
    console.log('继续启动前端服务...\n');
  }
  
  console.log('🚀 启动前端服务器...');
  
  const frontendProcess = spawn('npm', ['run', 'serve'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });
  
  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止前端服务器...');
    frontendProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  frontendProcess.on('exit', (code) => {
    console.log(`前端进程退出，代码: ${code}`);
    process.exit(code);
  });
}

startFrontend();