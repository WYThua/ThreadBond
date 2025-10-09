#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 ThreadBond 服务...\n');

// 先启动后端
console.log('📦 启动后端服务器...');
const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 等待3秒后启动前端
setTimeout(() => {
  console.log('\n🎨 启动前端服务器...');
  const frontendProcess = spawn('npm', ['run', 'serve'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止所有服务...');
    backendProcess.kill('SIGTERM');
    frontendProcess.kill('SIGTERM');
    process.exit(0);
  });

}, 3000);