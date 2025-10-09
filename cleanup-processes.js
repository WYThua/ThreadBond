#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 清理可能冲突的进程...');

try {
  // 停止所有 node 进程（Windows）
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
  console.log('✅ 已停止 Node.js 进程');
} catch (error) {
  console.log('ℹ️  没有找到需要停止的 Node.js 进程');
}

try {
  // 清理端口占用
  execSync('netsh int ipv4 reset', { stdio: 'ignore' });
  console.log('✅ 已重置网络配置');
} catch (error) {
  console.log('⚠️  网络配置重置失败，可能需要管理员权限');
}

console.log('🎉 清理完成，现在可以重新启动前端服务器');
