/**
 * 测试完整的注册流程
 * 从获取验证码到完成注册
 */

const axios = require('axios');

async function testCompleteRegisterFlow() {
  console.log('🚀 测试完整注册流程...');
  
  const testEmail = 'newuser' + Date.now() + '@example.com';
  const testPassword = 'testpassword123';
  const backendUrl = 'http://localhost:3000';
  
  try {
    // 1. 检查后端服务
    console.log('1️⃣ 检查后端服务状态...');
    await axios.get(`${backendUrl}/health`, { timeout: 5000 });
    console.log('✅ 后端服务正常运行');
    
    // 2. 获取验证码
    console.log('\n2️⃣ 获取验证码...');
    const codeResponse = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
      email: testEmail
    }, { timeout: 10000 });
    
    if (!codeResponse.data.success) {
      throw new Error('验证码获取失败: ' + codeResponse.data.message);
    }
    
    const verificationCode = codeResponse.data.data.code;
    console.log(`✅ 验证码获取成功: ${verificationCode}`);
    
    // 3. 执行注册
    console.log('\n3️⃣ 执行注册...');
    console.log('📊 注册数据:', {
      email: testEmail,
      verificationCode: verificationCode,
      password: '***'
    });
    
    const registerResponse = await axios.post(`${backendUrl}/api/auth/register`, {
      email: testEmail,
      verificationCode: verificationCode,
      password: testPassword
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 注册API调用成功');
    console.log('📨 响应数据:', JSON.stringify(registerResponse.data, null, 2));
    
    if (registerResponse.data.success) {
      console.log('\n🎉 注册成功！');
      console.log('👤 用户信息:', registerResponse.data.data.user);
      console.log('🎭 匿名身份:', registerResponse.data.data.anonymousIdentity);
      console.log('🔑 Token:', registerResponse.data.data.token ? '已生成' : '未生成');
      
      return {
        success: true,
        message: '完整注册流程测试成功',
        data: registerResponse.data.data
      };
    } else {
      console.log('❌ 注册失败:', registerResponse.data.message);
      return {
        success: false,
        message: registerResponse.data.message
      };
    }
    
  } catch (error) {
    console.log('❌ 注册流程失败');
    
    if (error.response) {
      console.log('📊 错误响应:', JSON.stringify(error.response.data, null, 2));
      console.log('🔢 状态码:', error.response.status);
      
      return {
        success: false,
        message: error.response.data.message || '注册API调用失败',
        statusCode: error.response.status,
        details: error.response.data
      };
    } else {
      console.log('❌ 网络错误:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// 测试前端注册逻辑模拟
function simulateFrontendRegister() {
  console.log('\n4️⃣ 模拟前端注册逻辑...');
  
  // 模拟前端表单数据
  const formData = {
    email: '1508214787@qq.com',
    verificationCode: '123456', // 这里应该是从第一步获取的
    password: 'testpassword123',
    confirmPassword: 'testpassword123',
    agreeTerms: true
  };
  
  // 模拟前端验证逻辑
  const errors = {
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
  };
  
  // 邮箱验证
  if (!formData.email) {
    errors.email = 'Please enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }
  
  // 验证码验证
  if (!formData.verificationCode) {
    errors.verificationCode = 'Please enter verification code';
  } else if (!/^\d{6}$/.test(formData.verificationCode)) {
    errors.verificationCode = 'Verification code must be 6 digits';
  }
  
  // 密码验证
  if (!formData.password) {
    errors.password = 'Please enter a password';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  // 确认密码验证
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // 检查是否可以提交
  const canSubmit = formData.email && 
                   formData.verificationCode &&
                   formData.password && 
                   formData.confirmPassword && 
                   formData.agreeTerms &&
                   formData.password === formData.confirmPassword &&
                   formData.password.length >= 6 &&
                   !errors.email &&
                   !errors.verificationCode &&
                   !errors.password &&
                   !errors.confirmPassword;
  
  console.log('📋 前端验证结果:');
  console.log('   邮箱验证:', errors.email || '✅ 通过');
  console.log('   验证码验证:', errors.verificationCode || '✅ 通过');
  console.log('   密码验证:', errors.password || '✅ 通过');
  console.log('   确认密码验证:', errors.confirmPassword || '✅ 通过');
  console.log('   同意条款:', formData.agreeTerms ? '✅ 已同意' : '❌ 未同意');
  console.log(`\n📊 表单可提交: ${canSubmit ? '✅ 是' : '❌ 否'}`);
  
  return { canSubmit, errors, formData };
}

// 提供修复建议
function provideFixSuggestions(result) {
  console.log('\n💡 修复建议:');
  console.log('=====================================');
  
  if (result.success) {
    console.log('✅ 后端注册流程正常工作');
    console.log('\n🔍 前端问题可能原因:');
    console.log('1. 用户没有正确填写所有必填字段');
    console.log('2. 验证码输入错误或已过期');
    console.log('3. 密码和确认密码不匹配');
    console.log('4. 没有勾选同意条款');
    console.log('5. 前端JavaScript错误阻止了提交');
    
    console.log('\n🔧 前端修复建议:');
    console.log('- 添加更详细的表单验证提示');
    console.log('- 在控制台输出调试信息');
    console.log('- 检查事件绑定是否正确');
    console.log('- 确保API调用没有被拦截');
    
  } else {
    console.log('❌ 后端注册流程有问题');
    
    if (result.statusCode === 400) {
      console.log('\n🔍 400错误可能原因:');
      console.log('- 验证码无效或已过期');
      console.log('- 邮箱格式不正确');
      console.log('- 密码不符合要求');
      console.log('- 邮箱已被注册');
    } else if (result.statusCode === 500) {
      console.log('\n🔍 500错误可能原因:');
      console.log('- 数据库连接问题');
      console.log('- 用户服务异常');
      console.log('- JWT密钥未配置');
    }
    
    console.log('\n🔧 后端修复建议:');
    console.log('- 检查数据库连接');
    console.log('- 查看后端服务日志');
    console.log('- 确认环境变量配置');
    console.log('- 重启后端服务');
  }
}

// 运行测试
if (require.main === module) {
  console.log('🚀 开始完整注册流程测试...');
  console.log('=====================================');
  
  testCompleteRegisterFlow()
    .then((result) => {
      simulateFrontendRegister();
      provideFixSuggestions(result);
      
      console.log('\n🏁 测试完成');
      console.log('=====================================');
      
      if (result.success) {
        console.log('🎉 注册流程测试成功！');
        console.log('💡 如果前端仍有问题，请检查浏览器控制台和网络面板');
      } else {
        console.log('❌ 注册流程测试失败');
        console.log('💡 请先修复后端问题再测试前端');
      }
    })
    .catch(error => {
      console.error('❌ 测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteRegisterFlow };