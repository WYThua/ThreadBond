#!/usr/bin/env node

const axios = require('axios');

async function testConnection() {
  console.log('🔍 测试前端到后端的连接...\n');
  
  const frontendOrigins = [
    'http://localhost:8083', // 前端实际运行的端口
    'http://localhost:8081',
    'http://localhost:8080'
  ];
  
  for (const origin of frontendOrigins) {
    console.log(`📡 测试来源: ${origin}`);
    
    try {
      // 1. 测试健康检查
      const healthResponse = await axios.get('http://localhost:3000/health', {
        headers: { 'Origin': origin }
      });
      
      console.log('   ✅ 健康检查成功');
      console.log('   CORS 头:', healthResponse.headers['access-control-allow-origin']);
      
    } catch (error) {
      console.log('   ❌ 健康检查失败:', error.message);
      continue;
    }
    
    try {
      // 2. 测试注册 API
      const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#'
      }, {
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('   ✅ 注册 API 调用成功');
      
    } catch (error) {
      if (error.response) {
        console.log('   ⚠️  注册 API 可访问，返回业务错误:', error.response.status);
        console.log('   错误信息:', error.response.data?.message || '未知错误');
      } else {
        console.log('   ❌ 注册 API 连接失败:', error.message);
      }
    }
    
    console.log('');
  }
  
  // 3. 检查前端环境变量
  console.log('📋 前端配置检查:');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.join(__dirname, 'frontend/.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('前端 .env 文件内容:');
    console.log(envContent);
    
  } catch (error) {
    console.log('❌ 无法读取前端 .env 文件');
  }
  
  // 4. 提供解决方案
  console.log('\n🔧 如果前端仍无法连接后端:');
  console.log('1. 确保前端运行在 http://localhost:8083');
  console.log('2. 检查浏览器控制台的网络请求');
  console.log('3. 清除浏览器缓存');
  console.log('4. 重启前端服务器');
  console.log('5. 检查防火墙设置');
}

testConnection().catch(console.error);