#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 测试前端重复加载修复...\n');

// 启动前端开发服务器
console.log('📦 启动前端开发服务器...');
const frontendProcess = spawn('npm', ['run', 'serve'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

let startupComplete = false;
let reloadCount = 0;
let errorCount = 0;

// 监听前端输出
frontendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('前端输出:', output.trim());
  
  // 检测启动完成
  if (output.includes('Local:') || output.includes('localhost')) {
    if (!startupComplete) {
      startupComplete = true;
      console.log('✅ 前端服务器启动完成');
      
      // 等待一段时间后检查状态
      setTimeout(() => {
        checkReloadStatus();
      }, 10000);
    }
  }
  
  // 检测重新加载
  if (output.includes('webpack compiled') || output.includes('Compiled successfully')) {
    reloadCount++;
    console.log(`🔄 检测到重新编译 (第${reloadCount}次)`);
  }
});

frontendProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('前端错误:', error.trim());
  
  // 统计错误
  if (error.includes('Error') || error.includes('Failed')) {
    errorCount++;
  }
});

function checkReloadStatus() {
  console.log('\n📊 重复加载检查结果:');
  console.log(`- 重新编译次数: ${reloadCount}`);
  console.log(`- 错误次数: ${errorCount}`);
  
  if (reloadCount <= 2 && errorCount === 0) {
    console.log('✅ 重复加载问题已修复');
  } else if (reloadCount > 5) {
    console.log('❌ 仍存在重复加载问题');
  } else {
    console.log('⚠️  需要继续观察');
  }
  
  // 继续监控
  setTimeout(() => {
    console.log('\n🔍 继续监控中...');
    setTimeout(() => {
      cleanup();
    }, 30000);
  }, 5000);
}

function cleanup() {
  console.log('\n🧹 清理进程...');
  
  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill('SIGTERM');
  }
  
  console.log('✅ 测试完成');
  process.exit(0);
}

// 处理进程退出
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 超时保护
setTimeout(() => {
  console.log('\n⏰ 测试超时，强制退出');
  cleanup();
}, 120000);