/**
 * 测试验证码发送是否已移除流量限制
 */

const axios = require('axios');

async function testNoRateLimit() {
  console.log('🚀 测试验证码发送流量限制移除...');
  
  const testEmail = '1508214787@qq.com';
  const backendUrl = 'http://localhost:3000';
  
  try {
    // 1. 检查后端服务状态
    console.log('1️⃣ 检查后端服务状态...');
    const healthResponse = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
    console.log('✅ 后端服务正常运行');
    
    // 2. 连续发送多次验证码请求
    console.log('\n2️⃣ 连续发送验证码请求测试...');
    
    const results = [];
    
    for (let i = 1; i <= 5; i++) {
      console.log(`\n📞 第${i}次请求:`);
      const startTime = Date.now();
      
      try {
        const response = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
          email: testEmail
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`✅ 请求成功 (${responseTime}ms)`);
        console.log('📨 响应:', response.data.success ? '成功' : '失败');
        
        if (response.data.data && response.data.data.code) {
          console.log(`🔢 验证码: ${response.data.data.code}`);
        }
        
        results.push({
          attempt: i,
          success: true,
          responseTime,
          code: response.data.data?.code
        });
        
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`❌ 请求失败 (${responseTime}ms)`);
        
        if (error.response) {
          console.log('📊 错误响应:', error.response.data);
          console.log('🔢 状态码:', error.response.status);
          
          if (error.response.status === 429) {
            console.log('⚠️ 仍然存在流量限制');
          }
        } else {
          console.log('❌ 网络错误:', error.message);
        }
        
        results.push({
          attempt: i,
          success: false,
          responseTime,
          error: error.response?.data || error.message
        });
      }
      
      // 短暂等待避免过快请求
      if (i < 5) {
        console.log('⏳ 等待1秒...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 3. 分析结果
    console.log('\n3️⃣ 结果分析:');
    console.log('=====================================');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const rateLimitErrors = results.filter(r => !r.success && r.error?.message?.includes('wait')).length;
    
    console.log(`📊 总请求数: ${results.length}`);
    console.log(`✅ 成功请求: ${successCount}`);
    console.log(`❌ 失败请求: ${failCount}`);
    console.log(`⚠️ 流量限制错误: ${rateLimitErrors}`);
    
    if (successCount === results.length) {
      console.log('\n🎉 流量限制已成功移除！');
      console.log('✅ 所有请求都成功了');
    } else if (rateLimitErrors > 0) {
      console.log('\n❌ 流量限制仍然存在');
      console.log('💡 可能需要重启后端服务');
    } else {
      console.log('\n⚠️ 部分请求失败，但不是因为流量限制');
    }
    
    // 4. 显示详细结果
    console.log('\n📋 详细结果:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      const code = result.code ? ` (验证码: ${result.code})` : '';
      console.log(`${status} 第${result.attempt}次: ${time}${code}`);
      
      if (!result.success && result.error) {
        const errorMsg = typeof result.error === 'object' ? 
          result.error.message || JSON.stringify(result.error) : 
          result.error;
        console.log(`   错误: ${errorMsg}`);
      }
    });
    
    return {
      success: successCount === results.length,
      totalRequests: results.length,
      successCount,
      failCount,
      rateLimitErrors,
      results
    };
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 运行测试
if (require.main === module) {
  console.log('🚀 开始测试验证码流量限制移除...');
  console.log('=====================================');
  
  testNoRateLimit()
    .then((result) => {
      console.log('\n📊 最终结果:');
      console.log('=====================================');
      
      if (result.success) {
        console.log('🎉 测试成功！流量限制已移除');
        console.log(`✅ ${result.successCount}/${result.totalRequests} 请求成功`);
      } else {
        console.log('❌ 测试失败');
        if (result.rateLimitErrors > 0) {
          console.log(`⚠️ 检测到 ${result.rateLimitErrors} 个流量限制错误`);
          console.log('💡 建议重启后端服务');
        }
      }
      
      console.log('\n💡 提示:');
      console.log('- 如果测试成功，用户现在可以正常发送验证码');
      console.log('- 建议在生产环境中保留适当的流量限制');
      console.log('- 可以通过前端逻辑控制发送频率');
    })
    .catch(error => {
      console.error('❌ 测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testNoRateLimit };