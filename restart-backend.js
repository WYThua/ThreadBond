/**
 * 重启后端服务以应用新配置
 */

const { spawn } = require('child_process');

async function restartBackend() {
  console.log('🔄 重启后端服务以应用新配置...');
  
  try {
    // 1. 停止现有容器
    console.log('🛑 停止现有容器...');
    const stopProcess = spawn('docker-compose', ['down'], {
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve) => {
      stopProcess.on('close', resolve);
    });
    
    console.log('✅ 容器已停止');
    
    // 2. 重新构建并启动后端服务
    console.log('🐳 重新启动后端服务...');
    const startProcess = spawn('docker-compose', ['up', '--build', '-d', 'mysql', 'redis', 'backend'], {
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve) => {
      startProcess.on('close', resolve);
    });
    
    console.log('✅ 后端服务已启动');
    
    // 3. 等待服务完全启动
    console.log('⏳ 等待服务完全启动...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 4. 检查服务状态
    console.log('🔍 检查服务状态...');
    const axios = require('axios');
    
    try {
      const response = await axios.get('http://localhost:3000/health', { timeout: 5000 });
      console.log('✅ 后端服务运行正常');
      console.log('📊 健康检查:', response.data);
      
      return true;
    } catch (error) {
      console.log('❌ 后端服务可能还未完全启动');
      console.log('💡 请等待几秒钟后手动测试');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 重启失败:', error);
    return false;
  }
}

if (require.main === module) {
  restartBackend()
    .then((success) => {
      if (success) {
        console.log('\n🎉 后端服务重启成功！');
        console.log('💡 现在可以测试验证码发送功能了');
        console.log('🧪 运行测试: node test-verification-fix.js');
      } else {
        console.log('\n⚠️ 重启完成，但服务状态检查失败');
        console.log('💡 请手动检查服务状态');
      }
    })
    .catch(error => {
      console.error('❌ 重启过程中发生错误:', error);
      process.exit(1);
    });
}

module.exports = { restartBackend };