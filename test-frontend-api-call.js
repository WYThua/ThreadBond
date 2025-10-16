/**
 * 模拟前端API调用测试验证码接口
 * 检查前端到后端的完整调用链路
 */

const axios = require('axios');

async function testFrontendAPICall() {
  console.log('🔍 模拟前端API调用测试...');
  
  const testEmail = '1508214787@qq.com';
  const backendUrl = 'http://localhost:3000';
  
  // 创建与前端相同配置的axios实例
  const api = axios.create({
    baseURL: `${backendUrl}/api`,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // 添加响应拦截器（简化版）
  api.interceptors.response.use(
    response => {
      console.log('✅ 响应拦截器 - 成功响应');
      const { data } = response;
      
      if (data.success) {
        console.log('📨 成功数据:', JSON.stringify(data, null, 2));
        return data;
      }
      
      const error = new Error(data.message || '请求失败');
      error.code = data.code;
      error.response = response;
      return Promise.reject(error);
    },
    error => {
      console.log('❌ 响应拦截器 - 错误响应');
      console.log('错误详情:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // 模拟前端的错误处理
      if (error.response) {
        const friendlyMessage = `请求失败: ${error.response.data?.message || error.message}`;
        console.log('🔄 转换为用户友好消息:', friendlyMessage);
        
        const userFriendlyError = new Error(friendlyMessage);
        userFriendlyError.statusCode = error.response.status;
        return Promise.reject(userFriendlyError);
      }
      
      return Promise.reject(error);
    }
  );
  
  try {
    console.log('📧 测试邮箱:', testEmail);
    console.log('🌐 API基础URL:', api.defaults.baseURL);
    console.log('⏰ 超时设置:', api.defaults.timeout + 'ms');
    
    console.log('\n🚀 发送验证码请求...');
    const startTime = Date.now();
    
    const response = await api.post('/auth/send-verification-code', {
      email: testEmail
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ 请求成功 (${responseTime}ms)`);
    console.log('📨 响应数据:', JSON.stringify(response, null, 2));
    
    // 检查响应结构
    if (response.success) {
      console.log('🎉 验证码发送成功');
      
      if (response.data && response.data.code) {
        console.log(`🔢 验证码: ${response.data.code}`);
      }
      
      if (response.data && response.data.expiresIn) {
        console.log(`⏰ 有效期: ${response.data.expiresIn}秒`);
      }
    }
    
    return {
      success: true,
      responseTime,
      data: response
    };
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - (startTime || endTime);
    
    console.log(`❌ 请求失败 (${responseTime}ms)`);
    console.log('错误类型:', error.constructor.name);
    console.log('错误消息:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ 请求超时');
    } else if (error.statusCode) {
      console.log('🔢 HTTP状态码:', error.statusCode);
    }
    
    return {
      success: false,
      responseTime,
      error: error.message
    };
  }
}

// 测试多次调用（模拟用户多次点击）
async function testMultipleCalls() {
  console.log('\n🔄 测试多次调用（模拟用户多次点击）...');
  
  const results = [];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📞 第${i}次调用:`);
    const result = await testFrontendAPICall();
    results.push(result);
    
    // 等待1秒再进行下一次调用
    if (i < 3) {
      console.log('⏳ 等待1秒...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 多次调用结果汇总:');
  results.forEach((result, index) => {
    console.log(`第${index + 1}次: ${result.success ? '✅ 成功' : '❌ 失败'} (${result.responseTime}ms)`);
    if (!result.success) {
      console.log(`   错误: ${result.error}`);
    }
  });
  
  return results;
}

// 测试网络连接
async function testNetworkConnection() {
  console.log('\n🌐 测试网络连接...');
  
  const testUrls = [
    'http://localhost:3000/health',
    'http://localhost:3000/api',
    'http://localhost:3000/api/auth/check-email'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`📡 测试: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ 连接正常 (状态: ${response.status})`);
    } catch (error) {
      console.log(`❌ 连接失败: ${error.message}`);
    }
  }
}

// 检查前端是否能访问后端
async function checkCORS() {
  console.log('\n🔒 检查CORS配置...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/auth/send-verification-code', {
      email: '1508214787@qq.com'
    }, {
      headers: {
        'Origin': 'http://localhost:8080',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ CORS配置正常');
    return true;
  } catch (error) {
    if (error.response && error.response.status !== 0) {
      console.log('✅ CORS配置正常（有响应）');
      return true;
    } else {
      console.log('❌ CORS配置可能有问题');
      console.log('错误:', error.message);
      return false;
    }
  }
}

// 运行所有测试
if (require.main === module) {
  console.log('🚀 开始前端API调用测试...');
  console.log('=====================================');
  
  Promise.resolve()
    .then(() => testNetworkConnection())
    .then(() => checkCORS())
    .then(() => testFrontendAPICall())
    .then(() => testMultipleCalls())
    .then(() => {
      console.log('\n✅ 所有测试完成');
      console.log('\n💡 如果测试都成功但前端仍然没有响应，请检查:');
      console.log('1. 前端控制台是否有错误');
      console.log('2. 网络面板中的请求状态');
      console.log('3. 前端代码中的错误处理逻辑');
      console.log('4. Toast消息是否被正确显示');
    })
    .catch(error => {
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendAPICall };