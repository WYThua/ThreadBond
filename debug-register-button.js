/**
 * 调试注册按钮问题
 * 检查为什么Create Account按钮没有调用接口
 */

const axios = require('axios');

async function debugRegisterButton() {
  console.log('🔍 调试注册按钮问题...');
  
  const testData = {
    email: '1508214787@qq.com',
    verificationCode: '123456', // 假设的验证码
    password: 'testpassword123',
    confirmPassword: 'testpassword123'
  };
  
  const backendUrl = 'http://localhost:3000';
  
  try {
    // 1. 检查后端服务状态
    console.log('1️⃣ 检查后端服务状态...');
    const healthResponse = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
    console.log('✅ 后端服务正常运行');
    
    // 2. 先获取验证码
    console.log('\n2️⃣ 获取验证码...');
    try {
      const codeResponse = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
        email: testData.email
      }, { timeout: 10000 });
      
      if (codeResponse.data.success && codeResponse.data.data.code) {
        testData.verificationCode = codeResponse.data.data.code;
        console.log(`✅ 验证码获取成功: ${testData.verificationCode}`);
      } else {
        console.log('⚠️ 验证码获取失败，使用默认验证码');
      }
    } catch (error) {
      console.log('⚠️ 验证码获取失败，使用默认验证码');
    }
    
    // 3. 测试注册API
    console.log('\n3️⃣ 测试注册API...');
    console.log('📊 注册数据:', {
      email: testData.email,
      verificationCode: testData.verificationCode,
      password: '***',
      confirmPassword: '***'
    });
    
    try {
      const registerResponse = await axios.post(`${backendUrl}/api/auth/register`, {
        email: testData.email,
        verificationCode: testData.verificationCode,
        password: testData.password
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 注册API调用成功');
      console.log('📨 响应数据:', JSON.stringify(registerResponse.data, null, 2));
      
      if (registerResponse.data.success) {
        console.log('🎉 注册成功！');
        return { success: true, message: '注册API正常工作' };
      } else {
        console.log('❌ 注册失败:', registerResponse.data.message);
        return { success: false, message: registerResponse.data.message };
      }
      
    } catch (error) {
      console.log('❌ 注册API调用失败');
      
      if (error.response) {
        console.log('📊 错误响应:', JSON.stringify(error.response.data, null, 2));
        console.log('🔢 状态码:', error.response.status);
        
        // 分析具体错误
        if (error.response.status === 400) {
          console.log('💡 可能的问题: 请求参数错误或验证码无效');
        } else if (error.response.status === 500) {
          console.log('💡 可能的问题: 服务器内部错误');
        }
        
        return { 
          success: false, 
          message: error.response.data.message || '注册API调用失败',
          statusCode: error.response.status
        };
      } else {
        console.log('❌ 网络错误:', error.message);
        return { success: false, message: '网络错误' };
      }
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message);
    return { success: false, message: error.message };
  }
}

// 检查前端表单验证逻辑
function checkFormValidation() {
  console.log('\n4️⃣ 检查前端表单验证逻辑...');
  
  const testForm = {
    email: '1508214787@qq.com',
    verificationCode: '123456',
    password: 'testpassword123',
    confirmPassword: 'testpassword123',
    agreeTerms: true
  };
  
  const errors = {
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
  };
  
  // 模拟canSubmit计算属性
  const canSubmit = testForm.email && 
                   testForm.verificationCode &&
                   testForm.password && 
                   testForm.confirmPassword && 
                   testForm.agreeTerms &&
                   testForm.password === testForm.confirmPassword &&
                   testForm.password.length >= 6 &&
                   !errors.email &&
                   !errors.verificationCode &&
                   !errors.password &&
                   !errors.confirmPassword;
  
  console.log('📋 表单数据检查:');
  console.log(`   邮箱: ${testForm.email ? '✅' : '❌'}`);
  console.log(`   验证码: ${testForm.verificationCode ? '✅' : '❌'}`);
  console.log(`   密码: ${testForm.password ? '✅' : '❌'}`);
  console.log(`   确认密码: ${testForm.confirmPassword ? '✅' : '❌'}`);
  console.log(`   同意条款: ${testForm.agreeTerms ? '✅' : '❌'}`);
  console.log(`   密码匹配: ${testForm.password === testForm.confirmPassword ? '✅' : '❌'}`);
  console.log(`   密码长度: ${testForm.password.length >= 6 ? '✅' : '❌'}`);
  console.log(`   无错误: ${!errors.email && !errors.verificationCode && !errors.password && !errors.confirmPassword ? '✅' : '❌'}`);
  
  console.log(`\n📊 canSubmit结果: ${canSubmit ? '✅ 可以提交' : '❌ 不能提交'}`);
  
  return canSubmit;
}

// 提供解决方案
function provideSolutions(result) {
  console.log('\n💡 问题分析和解决方案:');
  console.log('=====================================');
  
  if (result.success) {
    console.log('✅ 后端API正常工作');
    console.log('🔍 前端问题可能原因:');
    console.log('1. 按钮被禁用 (canSubmit返回false)');
    console.log('2. 表单验证失败');
    console.log('3. 前端JavaScript错误');
    console.log('4. 事件绑定问题');
    
    console.log('\n🔧 建议检查:');
    console.log('- 打开浏览器开发者工具查看控制台错误');
    console.log('- 检查网络面板是否有请求发出');
    console.log('- 确认所有表单字段都已填写');
    console.log('- 确认同意条款复选框已勾选');
    console.log('- 检查密码和确认密码是否匹配');
  } else {
    console.log('❌ 后端API有问题');
    console.log('🔍 可能的问题:');
    
    if (result.statusCode === 400) {
      console.log('- 验证码无效或已过期');
      console.log('- 请求参数格式错误');
      console.log('- 邮箱格式不正确');
    } else if (result.statusCode === 500) {
      console.log('- 数据库连接问题');
      console.log('- 服务器内部错误');
      console.log('- 用户服务异常');
    } else {
      console.log('- 网络连接问题');
      console.log('- 服务器不可用');
    }
    
    console.log('\n🔧 建议解决:');
    console.log('- 检查后端服务日志');
    console.log('- 确认数据库连接正常');
    console.log('- 重启后端服务');
  }
}

// 运行调试
if (require.main === module) {
  console.log('🚀 开始调试注册按钮问题...');
  console.log('=====================================');
  
  debugRegisterButton()
    .then((result) => {
      checkFormValidation();
      provideSolutions(result);
      
      console.log('\n🏁 调试完成');
      console.log('=====================================');
      
      if (result.success) {
        console.log('💡 建议: 检查前端代码和浏览器控制台');
      } else {
        console.log('💡 建议: 先修复后端API问题');
      }
    })
    .catch(error => {
      console.error('❌ 调试失败:', error);
      process.exit(1);
    });
}

module.exports = { debugRegisterButton };