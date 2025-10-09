#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');

console.log('🚀 启动并测试 ThreadBond 应用...\n');

let backendProcess = null;
let frontendProcess = null;

async function startBackendInDocker() {
  console.log('🐳 启动 Docker 后端服务...');
  
  return new Promise((resolve, reject) => {
    // 先停止现有容器
    const stopProcess = spawn('docker-compose', ['down'], {
      stdio: 'pipe',
      shell: true
    });
    
    stopProcess.on('exit', () => {
      // 启动后端服务
      backendProcess = spawn('docker-compose', ['up', '--build', 'mysql', 'redis', 'backend'], {
        stdio: 'pipe',
        shell: true
      });
      
      let mysqlReady = false;
      let backendReady = false;
      
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('🐳', output.trim());
        
        // 检测 MySQL 就绪
        if (output.includes('ready for connections') || output.includes('MySQL init process done')) {
          mysqlReady = true;
          console.log('✅ MySQL 数据库就绪');
        }
        
        // 检测后端就绪
        if (output.includes('ThreadBond 后端服务启动成功')) {
          backendReady = true;
          console.log('✅ 后端服务启动成功');
        }
        
        // 当两个服务都就绪时，解析 Promise
        if (mysqlReady && backendReady) {
          setTimeout(() => resolve(), 2000); // 等待2秒确保完全就绪
        }
      });
      
      backendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warning') && !error.includes('deprecated')) {
          console.error('❌ Docker 错误:', error.trim());
        }
      });
      
      // 超时处理
      setTimeout(() => {
        if (!backendReady) {
          console.log('⏰ 后端启动超时，但继续进行...');
          resolve();
        }
      }, 60000); // 60秒超时
    });
  });
}

async function testBackendConnection() {
  console.log('\n🔍 测试后端连接...');
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get('http://localhost:3000/health', { timeout: 5000 });
      console.log('✅ 后端连接成功');
      return true;
    } catch (error) {
      attempts++;
      console.log(`⏳ 连接尝试 ${attempts}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('❌ 后端连接失败');
  return false;
}

async function testCORSAndAPI() {
  console.log('\n🔍 测试 CORS 和 API...');
  
  try {
    // 测试 CORS
    const corsResponse = await axios.options('http://localhost:3000/api/auth/register', {
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS 配置正确');
    
    // 测试 API
    const apiResponse = await axios.post('http://localhost:3000/api/auth/register', {
      email: 'test@example.com',
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#'
    }, {
      headers: {
        'Origin': 'http://localhost:8081',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ API 调用成功');
    
  } catch (error) {
    if (error.response && error.response.status < 500) {
      console.log('✅ API 可访问（业务逻辑错误是正常的）');
    } else {
      console.log('❌ API 测试失败:', error.message);
      return false;
    }
  }
  
  return true;
}

function startFrontend() {
  console.log('\n🎨 启动前端服务器...');
  
  frontendProcess = spawn('npm', ['run', 'serve'], {
    cwd: require('path').join(__dirname, 'frontend'),
    stdio: 'pipe',
    shell: true
  });
  
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('🎨', output.trim());
    
    if (output.includes('App running at:')) {
      console.log('\n🎉 所有服务启动完成！');
      console.log('📍 前端地址: http://localhost:8081');
      console.log('📍 后端地址: http://localhost:3000');
      console.log('📊 健康检查: http://localhost:3000/health');
      console.log('\n现在可以测试注册功能了！');
    }
  });
  
  frontendProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('warning') && !error.includes('Deprecation')) {
      console.error('❌ 前端错误:', error.trim());
    }
  });
}

function gracefulShutdown() {
  console.log('\n🛑 正在停止所有服务...');
  
  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill('SIGTERM');
  }
  
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }
  
  // 停止 Docker 容器
  const downProcess = spawn('docker-compose', ['down'], {
    stdio: 'inherit',
    shell: true
  });
  
  downProcess.on('exit', () => {
    console.log('✅ 所有服务已停止');
    process.exit(0);
  });
}

async function main() {
  try {
    // 1. 启动后端
    await startBackendInDocker();
    
    // 2. 测试后端连接
    const backendConnected = await testBackendConnection();
    if (!backendConnected) {
      console.log('❌ 后端连接失败，停止启动流程');
      return;
    }
    
    // 3. 测试 CORS 和 API
    const apiWorking = await testCORSAndAPI();
    if (!apiWorking) {
      console.log('❌ API 测试失败，但继续启动前端');
    }
    
    // 4. 启动前端
    startFrontend();
    
  } catch (error) {
    console.error('❌ 启动过程中发生错误:', error);
  }
}

// 处理进程退出
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

main();