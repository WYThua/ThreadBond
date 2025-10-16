/**
 * 测试验证码发送无限制
 * 验证429错误是否已解决
 */

const axios = require('axios');

async function testVerificationUnlimited() {
  console.log('🚀 测试验证码发送无限制...');
  
  const testEmail = '1508214787@qq.com';
  const backendUrl = 'http://localhost:3000';
  
  try {
    // 1. 检查后端服务状态
    console.log('1️⃣ 检查后端服务状态...');
    const healthResponse = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
    console.log('✅ 后端服务正常运行');
    console.log('📊 环境:', healthResponse.data.environment || '未知');
    
    // 2. 单次测试
    console.log('\n2️⃣ 单次验证码发送测试...');
    
    try {
      const response = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
        email: testEmail
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 验证码发送成功');
      console.log('📨 响应数据:', JSON.stringify(response.data, null, 2));
      
      if (response.data.data && response.data.data.code) {
        console.log(`🔢 验证码: ${response.data.data.code}`);
      }
      
    } catch (error) {
      console.log('❌ 验证码发送失败');
      
      if (error.response) {
        console.log('📊 错误响应:', JSON.stringify(error.response.data, null, 2));
        console.log('🔢 状态码:', error.response.status);
        
        if (error.response.status === 429) {
          console.log('⚠️ 仍然存在429限制错误');
          console.log('💡 需要进一步检查限制逻辑');
          return false;
        }
      } else {
        console.log('❌ 网络错误:', error.message);
      }
      
      return false;
    }
    
    // 3. 快速连续测试
    console.log('\n3️⃣ 快速连续发送测试...');
    
    const results = [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n📞 第${i}次快速请求:`);
      
      try {
        const startTime = Date.now();
        const response = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
          email: `test${i}@example.com` // 使用不同邮箱避免业务逻辑限制
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ 请求成功 (${responseTime}ms)`);
        
        if (response.data.data && response.data.data.code) {
          console.log(`🔢 验证码: ${response.data.data.code}`);
        }
        
        results.push({ success: true, responseTime });
        
      } catch (error) {
        console.log(`❌ 请求失败`);
        
        if (error.response && error.response.status === 429) {
          console.log('⚠️ 仍然遇到429错误');
          results.push({ success: false, error: '429限制' });
        } else {
          console.log('❌ 其他错误:', error.response?.data || error.message);
          results.push({ success: false, error: '其他错误' });
        }
      }
      
      // 短暂间隔
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 4. 结果分析
    console.log('\n4️⃣ 结果分析:');
    console.log('=====================================');
    
    const successCount = results.filter(r => r.success).length;
    const rateLimitCount = results.filter(r => !r.success && r.error === '429限制').length;
    
    console.log(`📊 总请求数: ${results.length}`);
    console.log(`✅ 成功请求: ${successCount}`);
    console.log(`❌ 429限制错误: ${rateLimitCount}`);
    
    if (rateLimitCount === 0) {
      console.log('\n🎉 429限制已成功移除！');
      return true;
    } else {
      console.log('\n❌ 仍然存在429限制');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return false;
  }
}

// 检查环境变量
function checkEnvironment() {
  console.log('\n🌍 环境检查:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
  
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') {
    console.log('⚠️ 注意: NODE_ENV不是development，限制可能仍然生效');
  } else {
    console.log('✅ 开发环境，限制应该已跳过');
  }
}

// 提供解决方案
function provideSolution() {
  console.log('\n💡 如果仍然遇到429错误:');
  console.log('1. 确保后端服务已重启');
  console.log('2. 检查Docker容器环境变量');
  console.log('3. 等待现有限制窗口过期');
  console.log('4. 检查是否有其他中间件限制');
  
  console.log('\n🔧 手动解决方案:');
  console.log('- 重启Docker容器: docker restart threadbond-backend');
  console.log('- 清除验证码缓存: 重启会清除内存中的验证码');
  console.log('- 检查日志: docker logs threadbond-backend');
}

// 运行测试
if (require.main === module) {
  console.log('🚀 开始测试验证码发送无限制...');
  console.log('=====================================');
  
  checkEnvironment();
  
  testVerificationUnlimited()
    .then((success) => {
      console.log('\n📊 最终结果:');
      console.log('=====================================');
      
      if (success) {
        console.log('🎉 测试成功！429限制已移除');
        console.log('✅ 用户现在可以正常发送验证码');
      } else {
        console.log('❌ 测试失败，429限制仍然存在');
        provideSolution();
      }
    })
    .catch(error => {
      console.error('❌ 测试执行失败:', error);
      provideSolution();
      process.exit(1);
    });
}

module.exports = { testVerificationUnlimited };