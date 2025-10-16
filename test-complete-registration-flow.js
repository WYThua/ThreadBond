/**
 * 测试完整的注册流程
 * 使用新的邮箱地址测试验证码注册功能
 */

const axios = require('axios');

async function testCompleteRegistrationFlow() {
  console.log('🔐 测试完整的验证码注册流程...\n');

  const baseURL = 'http://localhost:3000/api';
  const testEmail = `test${Date.now()}@example.com`; // 使用时间戳确保邮箱唯一
  const testPassword = 'password123';

  try {
    console.log(`📧 使用测试邮箱: ${testEmail}`);

    // 步骤1: 发送验证码
    console.log('\n📤 步骤1: 发送验证码');
    const sendCodeResponse = await axios.post(`${baseURL}/auth/send-verification-code`, {
      email: testEmail
    });

    if (sendCodeResponse.data.success) {
      console.log('✅ 验证码发送成功');
      console.log('响应数据:', sendCodeResponse.data);
      
      const verificationCode = sendCodeResponse.data.data.code;
      if (verificationCode) {
        console.log(`🔢 收到验证码: ${verificationCode}`);
        
        // 步骤2: 使用验证码注册
        console.log('\n👤 步骤2: 使用验证码注册');
        const registerResponse = await axios.post(`${baseURL}/auth/register`, {
          email: testEmail,
          password: testPassword,
          verificationCode: verificationCode
        });

        if (registerResponse.data.success) {
          console.log('✅ 注册成功！');
          console.log('用户信息:', {
            id: registerResponse.data.data.user.id,
            email: registerResponse.data.data.user.email,
            createdAt: registerResponse.data.data.user.createdAt
          });
          console.log('匿名身份:', registerResponse.data.data.anonymousIdentity);
          console.log('JWT Token 长度:', registerResponse.data.data.token.length);
          
          // 步骤3: 测试登录
          console.log('\n🔑 步骤3: 测试登录');
          const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: testEmail,
            password: testPassword
          });
          
          if (loginResponse.data.success) {
            console.log('✅ 登录成功！');
            console.log('登录响应:', {
              message: loginResponse.data.message,
              userId: loginResponse.data.data.user.id
            });
          } else {
            console.log('❌ 登录失败:', loginResponse.data.message);
          }
          
        } else {
          console.log('❌ 注册失败:', registerResponse.data.message);
        }
      } else {
        console.log('❌ 开发环境下未返回验证码');
      }
    } else {
      console.log('❌ 验证码发送失败:', sendCodeResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('错误状态:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
  }

  console.log('\n✅ 完整注册流程测试完成');
}

// 测试错误场景
async function testErrorScenarios() {
  console.log('\n🚫 测试错误场景...');

  const baseURL = 'http://localhost:3000/api';

  const errorTests = [
    {
      name: '无效邮箱格式',
      data: { email: 'invalid-email' },
      endpoint: '/auth/send-verification-code'
    },
    {
      name: '缺少邮箱',
      data: {},
      endpoint: '/auth/send-verification-code'
    },
    {
      name: '无效验证码格式',
      data: { 
        email: 'test@example.com', 
        password: 'password123', 
        verificationCode: '12345' // 只有5位
      },
      endpoint: '/auth/register'
    },
    {
      name: '密码太短',
      data: { 
        email: 'test@example.com', 
        password: '123', 
        verificationCode: '123456'
      },
      endpoint: '/auth/register'
    },
    {
      name: '无效验证码',
      data: { 
        email: 'test@example.com', 
        password: 'password123', 
        verificationCode: '999999'
      },
      endpoint: '/auth/register'
    }
  ];

  for (const test of errorTests) {
    try {
      console.log(`\n🧪 测试: ${test.name}`);
      const response = await axios.post(`${baseURL}${test.endpoint}`, test.data);
      console.log('❌ 应该失败但成功了:', response.data);
    } catch (error) {
      if (error.response) {
        console.log(`✅ 正确拒绝: ${error.response.data.message}`);
      } else {
        console.log('❌ 网络错误:', error.message);
      }
    }
  }
}

// 主函数
async function main() {
  console.log('🧪 完整验证码注册流程测试');
  console.log('=====================================');

  await testCompleteRegistrationFlow();
  await testErrorScenarios();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testCompleteRegistrationFlow };