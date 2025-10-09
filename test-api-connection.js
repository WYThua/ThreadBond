#!/usr/bin/env node

const axios = require('axios');

async function testAPIConnection() {
  console.log('🔍 测试 API 连接...\n');
  
  const baseURL = 'http://localhost:3000/api';
  
  // 测试基本连接
  console.log('1. 测试基本连接...');
  try {
    const response = await axios.get(`${baseURL}/health`, { timeout: 5000 });
    console.log('✅ 基本连接成功:', response.status);
  } catch (error) {
    console.log('❌ 基本连接失败:', error.message);
    
    // 尝试测试根路径
    try {
      const rootResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
      console.log('✅ 根路径连接成功:', rootResponse.status);
    } catch (rootError) {
      console.log('❌ 根路径连接也失败:', rootError.message);
    }
  }
  
  // 测试注册端点
  console.log('\n2. 测试注册端点...');
  try {
    const testData = {
      email: 'test@example.com',
      password: 'test123456',
      confirmPassword: 'test123456'
    };
    
    const response = await axios.post(`${baseURL}/auth/register`, testData, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ 注册端点响应:', response.status);
  } catch (error) {
    if (error.response) {
      console.log('⚠️  注册端点可访问，但返回错误:', error.response.status, error.response.data);
    } else {
      console.log('❌ 注册端点连接失败:', error.message);
    }
  }
  
  // 测试 CORS 设置
  console.log('\n3. 测试 CORS 设置...');
  try {
    const response = await axios.options(`${baseURL}/auth/register`, {
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS 预检请求成功:', response.status);
  } catch (error) {
    console.log('❌ CORS 预检请求失败:', error.message);
  }
  
  // 检查防火墙和网络
  console.log('\n4. 网络诊断...');
  try {
    const { exec } = require('child_process');
    
    exec('ping -n 1 localhost', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ localhost ping 失败');
      } else {
        console.log('✅ localhost ping 成功');
      }
    });
    
    exec('telnet localhost 3000', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  telnet 测试可能失败（这是正常的）');
      } else {
        console.log('✅ telnet 连接成功');
      }
    });
    
  } catch (error) {
    console.log('⚠️  网络诊断工具不可用');
  }
}

testAPIConnection().catch(console.error);