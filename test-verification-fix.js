/**
 * 测试验证码发送修复效果
 * 验证限流配置是否正确
 */

const axios = require('axios');

async function testVerificationFix() {
  console.log('🔧 测试验证码发送修复效果...');
  
  const testEmail = '1508214787@qq.com';
  const backendUrl = 'http://localhost:3000';
  
  try {
    // 1. 检查后端服务状态
    console.log('1️⃣ 检查后端服务状态...');
    const healthResponse = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
    console.log('✅ 后端服务正常运行');
    
    // 2. 测试验证码发送
    console.log('\n2️⃣ 测试验证码发送...');
    console.log(`📧 测试邮箱: ${testEmail}`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
        email: testEmail
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ 验证码发送成功 (${responseTime}ms)`);
      console.log('📨 响应数据:', JSON.stringify(response.data, null, 2));
      
      if (response.data.data && response.data.data.code) {
        console.log(`🔢 验证码: ${response.data.data.code}`);
      }
      
      return {
        success: true,
        responseTime,
        code: response.data.data?.code
      };
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`❌ 验证码发送失败 (${responseTime}ms)`);
      
      if (error.response) {
        console.log('📊 错误响应:', JSON.stringify(error.response.data, null, 2));
        console.log('🔢 状态码:', error.response.status);
        
        if (error.response.status === 429) {
          console.log('⏰ 限流错误 - 请求过于频繁');
          const remainingTime = error.response.data.data?.remainingTime;
          if (remainingTime) {
            console.log(`⏳ 需要等待: ${remainingTime}秒`);
          }
        }
      } else {
        console.log('❌ 网络错误:', error.message);
      }
      
      return {
        success: false,
        responseTime,
        error: error.response?.data || error.message
      };
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 测试连续发送（验证限流是否合理）
async function testConsecutiveSends() {
  console.log('\n🔄 测试连续发送验证码...');
  
  const results = [];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📞 第${i}次发送:`);
    const result = await testVerificationFix();
    results.push(result);
    
    if (i < 3) {
      console.log('⏳ 等待2秒...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 连续发送结果汇总:');
  results.forEach((result, index) => {
    const status = result.success ? '✅ 成功' : '❌ 失败';
    const time = result.responseTime ? `(${result.responseTime}ms)` : '';
    console.log(`第${index + 1}次: ${status} ${time}`);
    
    if (!result.success && result.error) {
      if (typeof result.error === 'object' && result.error.message) {
        console.log(`   错误: ${result.error.message}`);
      } else {
        console.log(`   错误: ${result.error}`);
      }
    }
  });
  
  return results;
}

// 检查环境变量
function checkEnvironment() {
  console.log('\n🌍 检查环境配置...');
  
  console.log('环境变量:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
  console.log(`SKIP_RATE_LIMIT: ${process.env.SKIP_RATE_LIMIT || '未设置'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ 开发环境 - 限流配置已放宽');
  } else {
    console.log('⚠️ 生产环境 - 使用严格限流配置');
  }
}

// 提供解决方案
function provideSolutions() {
  console.log('\n💡 解决方案建议:');
  
  console.log('\n🔧 如果仍然遇到限流问题:');
  console.log('1. 确保后端服务已重启以应用新配置');
  console.log('2. 检查是否在开发环境 (NODE_ENV=development)');
  console.log('3. 可以设置 SKIP_RATE_LIMIT=true 完全跳过限流');
  console.log('4. 等待当前限流窗口过期');
  
  console.log('\n📱 前端用户体验改进:');
  console.log('1. 在按钮上显示倒计时');
  console.log('2. 禁用按钮防止重复点击');
  console.log('3. 显示友好的错误消息');
  console.log('4. 提供重试机制');
  
  console.log('\n🔒 生产环境安全建议:');
  console.log('1. 保持合理的限流配置');
  console.log('2. 使用邮箱作为限流key');
  console.log('3. 记录异常请求日志');
  console.log('4. 监控验证码发送频率');
}

// 运行测试
if (require.main === module) {
  console.log('🚀 开始验证码发送修复测试...');
  console.log('=====================================');
  
  checkEnvironment();
  
  testVerificationFix()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 单次发送测试成功！');
        return testConsecutiveSends();
      } else {
        console.log('\n❌ 单次发送测试失败');
        return Promise.resolve([]);
      }
    })
    .then(() => {
      provideSolutions();
      console.log('\n✅ 测试完成');
    })
    .catch(error => {
      console.error('❌ 测试失败:', error);
      provideSolutions();
      process.exit(1);
    });
}

module.exports = { testVerificationFix };