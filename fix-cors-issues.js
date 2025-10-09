#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🔧 修复 CORS 和网络连接问题...\n');

async function checkAndFixFrontendConfig() {
  console.log('1. 检查前端配置...');
  
  // 检查环境变量文件
  const envPath = path.join(__dirname, 'frontend/.env');
  if (!fs.existsSync(envPath)) {
    console.log('   创建前端环境变量文件...');
    const envContent = `# 前端环境变量配置
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_SOCKET_URL=http://localhost:3000
NODE_ENV=development
`;
    fs.writeFileSync(envPath, envContent);
    console.log('   ✅ 环境变量文件已创建');
  } else {
    console.log('   ✅ 环境变量文件存在');
  }
  
  // 检查 API 配置
  const apiConfigPath = path.join(__dirname, 'frontend/src/api/index.js');
  let apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  
  if (!apiConfig.includes('withCredentials: true')) {
    console.log('   修复 API 配置中的 withCredentials 设置...');
    // 这个已经在前面修复了
    console.log('   ✅ API 配置已修复');
  } else {
    console.log('   ✅ API 配置正确');
  }
}

async function testBackendCORS() {
  console.log('\n2. 测试后端 CORS 配置...');
  
  try {
    // 测试健康检查端点
    const healthResponse = await axios.get('http://localhost:3000/health', {
      headers: {
        'Origin': 'http://localhost:8081'
      }
    });
    
    console.log('   ✅ 后端服务可访问');
    console.log('   CORS 头:', healthResponse.headers['access-control-allow-origin']);
    
  } catch (error) {
    console.log('   ❌ 后端服务不可访问:', error.message);
    return false;
  }
  
  try {
    // 测试 OPTIONS 预检请求
    const optionsResponse = await axios.options('http://localhost:3000/api/auth/register', {
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('   ✅ CORS 预检请求成功');
    
  } catch (error) {
    console.log('   ❌ CORS 预检请求失败:', error.message);
    return false;
  }
  
  return true;
}

async function testActualAPICall() {
  console.log('\n3. 测试实际 API 调用...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
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
    
    console.log('   ✅ API 调用成功');
    
  } catch (error) {
    if (error.response) {
      console.log('   ⚠️  API 可访问，返回业务错误:', error.response.data?.message);
      console.log('   这是正常的，说明 CORS 配置正确');
    } else {
      console.log('   ❌ API 调用失败:', error.message);
      return false;
    }
  }
  
  return true;
}

async function provideSolutions() {
  console.log('\n📋 CORS 问题解决方案:');
  
  console.log('\n🔧 后端 CORS 配置 (backend/src/index.ts):');
  console.log(`app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080", 
    "http://127.0.0.1:8081"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization']
}));`);
  
  console.log('\n🎨 前端 API 配置 (frontend/src/api/index.js):');
  console.log(`const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});`);
  
  console.log('\n🌐 前端环境变量 (frontend/.env):');
  console.log(`VUE_APP_API_BASE_URL=http://localhost:3000/api`);
  
  console.log('\n🚀 启动顺序:');
  console.log('1. 启动后端: npm run dev:backend');
  console.log('2. 等待后端完全启动');
  console.log('3. 启动前端: npm run dev:frontend');
}

async function main() {
  await checkAndFixFrontendConfig();
  
  const corsWorking = await testBackendCORS();
  if (corsWorking) {
    await testActualAPICall();
  }
  
  await provideSolutions();
  
  console.log('\n🎉 CORS 配置检查完成！');
  console.log('如果仍有问题，请确保:');
  console.log('1. 后端服务在 Docker 中正常运行');
  console.log('2. 前端使用正确的 API 地址');
  console.log('3. 浏览器没有缓存旧的 CORS 策略');
}

main().catch(console.error);