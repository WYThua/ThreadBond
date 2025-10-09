#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 测试 Vue 配置修复...\n');

// 尝试启动前端开发服务器
console.log('📦 启动前端开发服务器...');
const frontendProcess = spawn('npm', ['run', 'serve'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

let hasError = false;
let startupSuccess = false;

// 监听前端输出
frontendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('前端输出:', output.trim());
  
  // 检测启动成功
  if (output.includes('Local:') || output.includes('localhost')) {
    startupSuccess = true;
    console.log('✅ 前端服务器启动成功！');
    
    // 等待几秒后停止
    setTimeout(() => {
      console.log('🛑 停止测试服务器...');
      frontendProcess.kill('SIGTERM');
    }, 5000);
  }
});

frontendProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('前端错误:', error.trim());
  
  // 检测配置错误
  if (error.includes('ValidationError') || error.includes('Invalid options')) {
    hasError = true;
    console.error('❌ 配置验证失败');
  }
});

frontendProcess.on('exit', (code) => {
  console.log(`\n📊 测试结果:`);
  console.log(`- 退出代码: ${code}`);
  console.log(`- 配置错误: ${hasError ? '是' : '否'}`);
  console.log(`- 启动成功: ${startupSuccess ? '是' : '否'}`);
  
  if (!hasError && startupSuccess) {
    console.log('✅ Vue 配置修复成功！');
  } else if (hasError) {
    console.log('❌ 仍存在配置错误，需要进一步修复');
  } else {
    console.log('⚠️  启动未完成，可能需要更多时间');
  }
  
  process.exit(code);
});

// 超时保护
setTimeout(() => {
  if (!startupSuccess && !hasError) {
    console.log('\n⏰ 测试超时，强制停止');
    frontendProcess.kill('SIGTERM');
  }
}, 30000);