/**
 * 启动前端进行密码图标测试
 */

const { spawn } = require('child_process');
const path = require('path');

async function startFrontend() {
  console.log('🚀 启动前端服务进行密码图标测试...');
  
  const frontendPath = path.join(__dirname, 'frontend');
  
  console.log('📁 前端目录:', frontendPath);
  console.log('🔧 启动Vue开发服务器...');
  
  const vueProcess = spawn('npm', ['run', 'serve'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true
  });
  
  vueProcess.on('error', (error) => {
    console.error('❌ 启动前端服务失败:', error);
  });
  
  vueProcess.on('close', (code) => {
    console.log(`🛑 前端服务已停止，退出码: ${code}`);
  });
  
  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止前端服务...');
    vueProcess.kill('SIGINT');
    process.exit(0);
  });
  
  console.log('✅ 前端服务启动中...');
  console.log('🌐 请访问: http://localhost:8080');
  console.log('📝 测试页面:');
  console.log('   - 注册页面: http://localhost:8080/register');
  console.log('   - 登录页面: http://localhost:8080/login');
  console.log('\n🔍 测试要点:');
  console.log('   1. 密码字段右端是否显示眼睛图标');
  console.log('   2. 点击图标是否能切换密码显示状态');
  console.log('   3. 图标状态是否正确反映当前显示状态');
  console.log('   4. 悬停效果是否正常');
  console.log('\n按 Ctrl+C 停止服务');
}

if (require.main === module) {
  startFrontend().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}

module.exports = { startFrontend };