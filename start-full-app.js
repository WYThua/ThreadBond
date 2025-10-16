/**
 * 启动完整应用程序
 * 后端在Docker中运行，前端在本地运行
 */

const { spawn } = require('child_process');
const path = require('path');

async function startFullApp() {
  console.log('🚀 启动ThreadBond完整应用程序...');
  console.log('=====================================');
  
  try {
    // 1. 启动Docker后端服务
    console.log('🐳 启动Docker后端服务...');
    console.log('📍 后端服务将运行在: http://localhost:3000');
    
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
    console.log('🐳 启动后端、数据库和缓存服务...');
    const backendProcess = spawn('docker-compose', ['up', '--build', 'mysql', 'redis', 'backend'], {
      stdio: 'pipe',
      shell: true
    });
    
    // 监听后端日志
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('ThreadBond 后端服务启动成功')) {
        console.log('✅ 后端服务启动成功');
      }
      if (output.includes('ready for connections')) {
        console.log('✅ 数据库连接就绪');
      }
      if (output.includes('Ready to accept connections')) {
        console.log('✅ Redis缓存就绪');
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('Failed')) {
        console.log('⚠️ 后端警告:', error.trim());
      }
    });
    
    // 等待后端服务启动
    console.log('⏳ 等待后端服务完全启动...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // 2. 启动前端服务
    console.log('\n📱 启动前端服务...');
    console.log('📍 前端服务将运行在: http://localhost:8080');
    
    const frontendPath = path.join(__dirname, 'frontend');
    const frontendProcess = spawn('npm', ['run', 'serve'], {
      cwd: frontendPath,
      stdio: 'pipe',
      shell: true
    });
    
    // 监听前端日志
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('App running at')) {
        console.log('✅ 前端服务启动成功');
        console.log('🌐 应用访问地址: http://localhost:8080');
      }
      if (output.includes('compiled successfully')) {
        console.log('✅ 前端编译成功');
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('Failed')) {
        console.log('⚠️ 前端警告:', error.trim());
      }
    });
    
    // 3. 显示启动信息
    console.log('\n🎉 应用程序启动完成！');
    console.log('=====================================');
    console.log('📍 前端地址: http://localhost:8080');
    console.log('📍 后端地址: http://localhost:3000');
    console.log('📍 健康检查: http://localhost:3000/health');
    console.log('');
    console.log('📱 可用页面:');
    console.log('   - 注册页面: http://localhost:8080/register');
    console.log('   - 登录页面: http://localhost:8080/login');
    console.log('   - 首页: http://localhost:8080/home');
    console.log('');
    console.log('🔧 调试工具:');
    console.log('   - 后端日志: docker logs threadbond-backend');
    console.log('   - 数据库日志: docker logs threadbond-mysql');
    console.log('   - Redis日志: docker logs threadbond-redis');
    console.log('');
    console.log('⚠️ 注意事项:');
    console.log('   - 后端运行在Docker容器中');
    console.log('   - 数据库操作只能在Docker中进行');
    console.log('   - 前端运行在本地，可以热重载');
    console.log('');
    console.log('🛑 按 Ctrl+C 停止所有服务');
    
    // 4. 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止所有服务...');
      
      // 停止前端
      if (frontendProcess && !frontendProcess.killed) {
        frontendProcess.kill('SIGINT');
        console.log('✅ 前端服务已停止');
      }
      
      // 停止Docker服务
      const stopDockerProcess = spawn('docker-compose', ['down'], {
        stdio: 'inherit',
        shell: true
      });
      
      stopDockerProcess.on('close', () => {
        console.log('✅ Docker服务已停止');
        console.log('👋 再见！');
        process.exit(0);
      });
    });
    
    // 保持进程运行
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

// 检查Docker是否可用
async function checkDocker() {
  console.log('🔍 检查Docker环境...');
  
  try {
    const { spawn } = require('child_process');
    const dockerCheck = spawn('docker', ['--version'], { shell: true });
    
    return new Promise((resolve, reject) => {
      dockerCheck.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Docker已安装');
          resolve(true);
        } else {
          console.log('❌ Docker未安装或不可用');
          reject(new Error('Docker不可用'));
        }
      });
      
      dockerCheck.on('error', () => {
        console.log('❌ Docker未安装或不可用');
        reject(new Error('Docker不可用'));
      });
    });
  } catch (error) {
    throw new Error('Docker检查失败');
  }
}

// 检查端口是否被占用
async function checkPorts() {
  console.log('🔍 检查端口占用情况...');
  
  const axios = require('axios');
  
  // 检查3000端口（后端）
  try {
    await axios.get('http://localhost:3000/health', { timeout: 2000 });
    console.log('⚠️ 端口3000已被占用，将重启后端服务');
  } catch (error) {
    console.log('✅ 端口3000可用');
  }
  
  // 检查8080端口（前端）
  try {
    await axios.get('http://localhost:8080', { timeout: 2000 });
    console.log('⚠️ 端口8080已被占用，可能需要手动停止');
  } catch (error) {
    console.log('✅ 端口8080可用');
  }
}

// 运行启动程序
if (require.main === module) {
  console.log('🚀 ThreadBond应用程序启动器');
  console.log('=====================================');
  
  checkDocker()
    .then(() => checkPorts())
    .then(() => startFullApp())
    .catch(error => {
      console.error('❌ 启动前检查失败:', error.message);
      console.log('\n💡 解决建议:');
      console.log('1. 确保Docker Desktop已安装并运行');
      console.log('2. 确保端口3000和8080未被占用');
      console.log('3. 检查网络连接');
      process.exit(1);
    });
}

module.exports = { startFullApp };