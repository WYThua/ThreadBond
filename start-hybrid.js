#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 混合启动模式：Docker 后端 + 本地前端\n');

let backendProcess = null;
let frontendProcess = null;

async function startBackendInDocker() {
  console.log('🐳 启动 Docker 后端服务（MySQL + Redis + Backend）...');
  
  // 停止现有容器
  const stopProcess = spawn('docker-compose', ['down'], {
    stdio: 'pipe',
    shell: true
  });
  
  return new Promise((resolve) => {
    stopProcess.on('exit', () => {
      // 启动后端相关服务
      backendProcess = spawn('docker-compose', ['up', '--build', 'mysql', 'redis', 'backend'], {
        stdio: 'pipe',
        shell: true
      });
      
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('🐳 Docker:', output.trim());
        
        // 检测后端启动成功
        if (output.includes('ThreadBond 后端服务启动成功') || 
            output.includes('🚀') || 
            output.includes('localhost:3000')) {
          console.log('✅ Docker 后端服务启动成功！');
          resolve();
        }
      });
      
      backendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warning') && !error.includes('deprecated')) {
          console.error('❌ Docker 错误:', error.trim());
        }
      });
      
      // 如果 10 秒后还没有检测到启动成功，也继续启动前端
      setTimeout(() => {
        console.log('⏰ 超时，尝试启动前端...');
        resolve();
      }, 10000);
    });
  });
}

function startFrontendLocally() {
  console.log('🎨 启动本地前端服务器...');
  
  frontendProcess = spawn('npm', ['run', 'serve'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'pipe',
    shell: true
  });
  
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('🎨 前端:', output.trim());
    
    if (output.includes('App running at:')) {
      console.log('✅ 前端服务器启动成功！');
      console.log('\n🎉 所有服务启动完成！');
      console.log('📍 后端地址: http://localhost:3000');
      console.log('📍 前端地址: http://localhost:8081');
      console.log('📊 健康检查: http://localhost:3000/health');
      console.log('\n按 Ctrl+C 停止所有服务');
    }
  });
  
  frontendProcess.stderr.on('data', (data) => {
    const error = data.toString();
    // 只显示重要错误，忽略警告
    if (!error.includes('warning') && !error.includes('Deprecation')) {
      console.error('❌ 前端错误:', error.trim());
    }
  });
}

async function startServices() {
  try {
    // 先启动 Docker 后端
    await startBackendInDocker();
    
    // 等待 3 秒确保后端完全启动
    setTimeout(() => {
      startFrontendLocally();
    }, 3000);
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
  }
}

// 优雅关闭
function gracefulShutdown() {
  console.log('\n🛑 正在停止所有服务...');
  
  if (frontendProcess && !frontendProcess.killed) {
    console.log('🛑 停止前端服务器...');
    frontendProcess.kill('SIGTERM');
  }
  
  if (backendProcess && !backendProcess.killed) {
    console.log('🛑 停止 Docker 服务...');
    backendProcess.kill('SIGTERM');
    
    // 额外执行 docker-compose down 确保清理
    const downProcess = spawn('docker-compose', ['down'], {
      stdio: 'inherit',
      shell: true
    });
    
    downProcess.on('exit', () => {
      console.log('✅ 所有服务已停止');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// 处理进程退出信号
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// 检查 Docker 是否可用
console.log('🔍 检查 Docker 状态...');
const dockerCheck = spawn('docker', ['--version'], { shell: true });

dockerCheck.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Docker 可用');
    startServices();
  } else {
    console.log('❌ Docker 不可用，请先安装并启动 Docker Desktop');
  }
});

dockerCheck.on('error', () => {
  console.log('❌ Docker 不可用，请先安装并启动 Docker Desktop');
});