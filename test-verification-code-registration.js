/**
 * 测试验证码注册功能
 * 验证邮箱验证码 + 密码的注册方式
 */

const axios = require('axios');

async function testVerificationCodeRegistration() {
  console.log('🧪 测试验证码注册功能...\n');

  const baseURL = 'http://localhost:3000/api';
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  try {
    // 测试1: 发送验证码
    console.log('📧 测试1: 发送验证码');
    const sendCodeResponse = await axios.post(`${baseURL}/auth/send-verification-code`, {
      email: testEmail
    });

    console.log('发送验证码响应:', sendCodeResponse.data);
    
    if (sendCodeResponse.data.success) {
      console.log('✅ 验证码发送成功');
      
      // 在开发环境下，验证码会在响应中返回
      const verificationCode = sendCodeResponse.data.data.code;
      if (verificationCode) {
        console.log('🔢 验证码:', verificationCode);
        
        // 测试2: 使用验证码注册
        console.log('\n👤 测试2: 使用验证码注册');
        const registerResponse = await axios.post(`${baseURL}/auth/register`, {
          email: testEmail,
          password: testPassword,
          verificationCode: verificationCode
        });

        console.log('注册响应:', registerResponse.data);
        
        if (registerResponse.data.success) {
          console.log('✅ 注册成功');
          console.log('用户信息:', registerResponse.data.data.user);
          console.log('匿名身份:', registerResponse.data.data.anonymousIdentity);
        } else {
          console.log('❌ 注册失败:', registerResponse.data.message);
        }
      } else {
        console.log('❌ 开发环境下未返回验证码');
      }
    } else {
      console.log('❌ 验证码发送失败:', sendCodeResponse.data.message);
    }

    // 测试3: 测试无效验证码
    console.log('\n🚫 测试3: 测试无效验证码');
    try {
      const invalidCodeResponse = await axios.post(`${baseURL}/auth/register`, {
        email: 'test2@example.com',
        password: testPassword,
        verificationCode: '123456'
      });
      console.log('❌ 应该失败但成功了:', invalidCodeResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('✅ 无效验证码正确被拒绝:', error.response.data.message);
      } else {
        console.log('❌ 网络错误:', error.message);
      }
    }

    // 测试4: 测试重复发送验证码的频率限制
    console.log('\n⏱️ 测试4: 测试验证码频率限制');
    try {
      const duplicateCodeResponse = await axios.post(`${baseURL}/auth/send-verification-code`, {
        email: testEmail
      });
      
      if (duplicateCodeResponse.data.success) {
        console.log('❌ 应该被频率限制但成功了');
      } else {
        console.log('✅ 频率限制正常工作:', duplicateCodeResponse.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('✅ 频率限制正常工作:', error.response.data.message);
      } else {
        console.log('❌ 意外错误:', error.message);
      }
    }

    // 测试5: 测试邮箱格式验证
    console.log('\n📧 测试5: 测试邮箱格式验证');
    try {
      const invalidEmailResponse = await axios.post(`${baseURL}/auth/send-verification-code`, {
        email: 'invalid-email'
      });
      console.log('❌ 应该失败但成功了:', invalidEmailResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('✅ 无效邮箱格式正确被拒绝:', error.response.data.message);
      } else {
        console.log('❌ 网络错误:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }

  console.log('\n✅ 验证码注册功能测试完成');
}

// 测试前端验证逻辑
function testFrontendValidation() {
  console.log('\n🎨 测试前端验证逻辑...');

  // 模拟前端验证函数
  function validateEmail(email) {
    if (!email) return 'Please enter your email address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return '';
  }

  function validateVerificationCode(code) {
    if (!code) return 'Please enter verification code';
    if (!/^\d{6}$/.test(code)) return 'Verification code must be 6 digits';
    return '';
  }

  function validatePassword(password) {
    if (!password) return 'Please enter a password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }

  // 测试用例
  const testCases = [
    { email: '', code: '', password: '', desc: '空值测试' },
    { email: 'invalid', code: '12345', password: '123', desc: '无效格式测试' },
    { email: 'test@example.com', code: '123456', password: 'password123', desc: '有效数据测试' }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n测试用例 ${index + 1}: ${testCase.desc}`);
    console.log('邮箱验证:', validateEmail(testCase.email) || '✅ 通过');
    console.log('验证码验证:', validateVerificationCode(testCase.code) || '✅ 通过');
    console.log('密码验证:', validatePassword(testCase.password) || '✅ 通过');
  });

  console.log('\n✅ 前端验证逻辑测试完成');
}

// 主函数
async function main() {
  console.log('🔐 验证码注册功能测试');
  console.log('=====================================\n');

  // 测试前端验证
  testFrontendValidation();

  // 测试后端API（需要后端服务运行）
  console.log('\n🌐 后端API测试');
  console.log('注意: 需要后端服务在 http://localhost:3000 运行\n');
  
  try {
    await testVerificationCodeRegistration();
  } catch (error) {
    console.log('❌ 后端服务可能未运行，跳过API测试');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testVerificationCodeRegistration };