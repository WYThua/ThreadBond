/**
 * 只启动后端服务进行测试
 */

const { spawn } = require('child_process');

async function startBackendOnly() {
  console.log('🚀 启动后端服务...');
  
  try {
    // 停止现有容器
    console.log('🛑 停止现有容器...');
    const stopProcess = spawn('docker-compose', ['down'], {
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve) => {
      stopProcess.on('close', resolve);
    });
    
    // 启动后端相关服务
    console.log('🐳 启动后端服务...');
    const startProcess = spawn('docker-compose', ['up', '--build', 'mysql', 'redis', 'backend'], {
      stdio: 'inherit',
      shell: true
    });
    
    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止服务...');
      startProcess.kill('SIGINT');
      
      // 停止容器
      const stopProcess = spawn('docker-compose', ['down'], {
        stdio: 'inherit',
        shell: true
      });
      
      stopProcess.on('close', () => {
        process.exit(0);
      });
    });
    
    startProcess.on('close', (code) => {
      console.log(`🛑 后端服务已停止，退出码: ${code}`);
    });
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startBackendOnly();
}

module.exports = { startBackendOnly };