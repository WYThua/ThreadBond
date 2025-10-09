#!/usr/bin/env node

const axios = require('axios');

async function testBackendAPI() {
  console.log('🔍 测试后端 API 详细错误信息...\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ 健康检查成功:', healthResponse.data);
    
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
    return;
  }
  
  try {
    // 2. 测试注册 API - 使用符合要求的密码
    console.log('\n2. 测试注册 API...');
    const registerData = {
      email: 'test@example.com',
      password: 'Test123!@#' // 符合要求：大小写字母、数字、特殊字符
    };
    
    const registerResponse = await axios.post(`${baseURL}/api/auth/register`, registerData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8083'
      },
      withCredentials: true
    });
    
    console.log('✅ 注册 API 成功:', registerResponse.data);
    
  } catch (error) {
    console.log('❌ 注册 API 失败:');
    
    if (error.response) {
      console.log('   状态码:', error.response.status);
      console.log('   错误信息:', error.response.data);
      console.log('   响应头:', error.response.headers);
    } else {
      console.log('   网络错误:', error.message);
    }
  }
  
  try {
    // 3. 测试不符合要求的密码
    console.log('\n3. 测试弱密码...');
    const weakPasswordData = {
      email: 'test2@example.com',
      password: '123456' // 不符合要求的弱密码
    };
    
    const weakPasswordResponse = await axios.post(`${baseURL}/api/auth/register`, weakPasswordData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8083'
      },
      withCredentials: true
    });
    
    console.log('⚠️  弱密码竟然成功了:', weakPasswordResponse.data);
    
  } catch (error) {
    console.log('✅ 弱密码被正确拒绝:');
    
    if (error.response) {
      console.log('   状态码:', error.response.status);
      console.log('   错误信息:', error.response.data);
    }
  }
  
  try {
    // 4. 测试邮箱检查 API
    console.log('\n4. 测试邮箱检查 API...');
    const emailCheckData = {
      email: 'test@example.com'
    };
    
    const emailCheckResponse = await axios.post(`${baseURL}/api/auth/check-email`, emailCheckData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8083'
      }
    });
    
    console.log('✅ 邮箱检查成功:', emailCheckResponse.data);
    
  } catch (error) {
    console.log('❌ 邮箱检查失败:');
    
    if (error.response) {
      console.log('   状态码:', error.response.status);
      console.log('   错误信息:', error.response.data);
    }
  }
}

testBackendAPI().catch(console.error);