#!/usr/bin/env node

const axios = require('axios');

async function testCORS() {
  console.log('🔍 测试 CORS 配置...\n');
  
  const baseURL = 'http://localhost:3000';
  const origins = [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://172.16.1.75:8081'
  ];
  
  for (const origin of origins) {
    console.log(`📡 测试来源: ${origin}`);
    
    try {
      // 1. 测试预检请求 (OPTIONS)
      console.log('  1. 测试 OPTIONS 预检请求...');
      const optionsResponse = await axios.options(`${baseURL}/api/auth/register`, {
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log('     ✅ OPTIONS 请求成功');
      console.log('     响应头:', {
        'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
      });
      
    } catch (error) {
      console.log('     ❌ OPTIONS 请求失败:', error.message);
    }
    
    try {
      // 2. 测试实际 POST 请求
      console.log('  2. 测试 POST 请求...');
      const postResponse = await axios.post(`${baseURL}/api/auth/register`, {
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#'
      }, {
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('     ✅ POST 请求成功');
      
    } catch (error) {
      if (error.response) {
        console.log('     ⚠️  POST 请求可访问，但返回业务错误:', error.response.status);
        console.log('     响应头:', {
          'Access-Control-Allow-Origin': error.response.headers['access-control-allow-origin']
        });
      } else {
        console.log('     ❌ POST 请求失败:', error.message);
      }
    }
    
    try {
      // 3. 测试 GET 请求
      console.log('  3. 测试 GET 请求...');
      const getResponse = await axios.get(`${baseURL}/health`, {
        headers: {
          'Origin': origin
        }
      });
      
      console.log('     ✅ GET 请求成功');
      console.log('     响应头:', {
        'Access-Control-Allow-Origin': getResponse.headers['access-control-allow-origin']
      });
      
    } catch (error) {
      console.log('     ❌ GET 请求失败:', error.message);
    }
    
    console.log('');
  }
  
  // 4. 测试浏览器环境模拟
  console.log('🌐 模拟浏览器环境测试...');
  
  try {
    const response = await axios.post(`${baseURL}/api/auth/register`, {
      email: 'browser-test@example.com',
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#'
    }, {
      headers: {
        'Origin': 'http://localhost:8081',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://localhost:8081/',
        'Accept': 'application/json, text/plain, */*'
      },
      withCredentials: true
    });
    
    console.log('✅ 浏览器环境模拟测试成功');
    
  } catch (error) {
    if (error.response) {
      console.log('⚠️  浏览器环境可访问，业务错误:', error.response.data?.message);
    } else {
      console.log('❌ 浏览器环境测试失败:', error.message);
    }
  }
}

async function checkBackendStatus() {
  console.log('🔍 检查后端服务状态...');
  
  try {
    const response = await axios.get('http://localhost:3000/health', { timeout: 3000 });
    console.log('✅ 后端服务正常运行');
    return true;
  } catch (error) {
    console.log('❌ 后端服务不可访问:', error.message);
    console.log('请先启动后端服务: npm run dev:backend');
    return false;
  }
}

async function main() {
  const backendRunning = await checkBackendStatus();
  
  if (backendRunning) {
    await testCORS();
    
    console.log('📋 CORS 配置建议:');
    console.log('1. 确保后端包含所有必要的 CORS 头');
    console.log('2. 检查前端请求是否包含正确的 Origin 头');
    console.log('3. 验证 credentials: true 配置是否正确');
    console.log('4. 确保预检请求 (OPTIONS) 正常响应');
  }
}

main().catch(console.error);