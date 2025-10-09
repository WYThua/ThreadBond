#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 检查是否已有进程在运行
const { execSync } = require('child_process');

try {
  // 检查端口 8080 是否被占用
  const result = execSync('netstat -an | findstr :8080', { encoding: 'utf8' });
  if (result.includes('LISTENING')) {
    console.log('⚠️  端口 8080 已被占用，请先停止现有进程');
    console.log('可以运行: taskkill /f /im node.exe');
    process.exit(1);
  }
} catch (error) {
  // 端口未被占用，继续启动
}

console.log('🚀 启动前端开发服务器...');

const frontendProcess = spawn('npm', ['run', 'serve'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontendProcess.on('error', (error) => {
  console.error('启动失败:', error);
});

frontendProcess.on('exit', (code) => {
  console.log(`前端服务器退出，代码: ${code}`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n正在停止前端服务器...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});
