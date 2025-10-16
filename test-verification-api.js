/**
 * 测试验证码发送接口
 * 检查 auth/send-verification-code 接口是否正常工作
 */

const axios = require('axios');

async function testVerificationAPI() {
  console.log('🔍 测试验证码发送接口...');
  
  const testEmail = '1508214787@qq.com';
  const backendUrl = 'http://localhost:3000';
  
  try {
    // 1. 检查后端服务状态
    console.log('1️⃣ 检查后端服务状态...');
    try {
      const healthResponse = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
      console.log('✅ 后端服务正常运行');
      console.log('📊 健康检查:', healthResponse.data);
    } catch (error) {
      console.log('❌ 后端服务未运行或无法访问');
      console.log('💡 请先启动后端服务');
      
      if (error.code === 'ECONNREFUSED') {
        console.log('🔧 连接被拒绝，请检查:');
        console.log('   - 后端服务是否启动 (端口3000)');
        console.log('   - Docker容器是否运行');
        console.log('   - 防火墙设置');
      }
      return;
    }
    
    // 2. 测试验证码发送接口
    console.log('\n2️⃣ 测试验证码发送接口...');
    console.log(`📧 测试邮箱: ${testEmail}`);
    console.log(`🌐 请求URL: ${backendUrl}/api/auth/send-verification-code`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
        email: testEmail
      }, {
        timeout: 30000, // 30秒超时
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ 接口响应成功 (${responseTime}ms)`);
      console.log('📨 响应数据:', JSON.stringify(response.data, null, 2));
      
      // 检查响应内容
      if (response.data.success) {
        console.log('🎉 验证码发送成功');
        
        if (response.data.data && response.data.data.code) {
          console.log(`🔢 验证码: ${response.data.data.code}`);
        }
        
        if (response.data.data && response.data.data.expiresIn) {
          console.log(`⏰ 有效期: ${response.data.data.expiresIn}秒`);
        }
      } else {
        console.log('❌ 验证码发送失败');
        console.log('📝 错误信息:', response.data.message);
      }
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`❌ 接口请求失败 (${responseTime}ms)`);
      
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ 请求超时 - 接口无响应');
        console.log('🔍 可能的原因:');
        console.log('   - 后端服务处理时间过长');
        console.log('   - 邮件发送服务阻塞');
        console.log('   - 数据库连接问题');
        console.log('   - 网络延迟');
      } else if (error.response) {
        console.log('📊 错误响应:', JSON.stringify(error.response.data, null, 2));
        console.log('🔢 状态码:', error.response.status);
        
        switch (error.response.status) {
          case 400:
            console.log('📝 错误类型: 请求参数错误');
            break;
          case 429:
            console.log('⏰ 错误类型: 请求过于频繁');
            break;
          case 500:
            console.log('🔧 错误类型: 服务器内部错误');
            break;
          default:
            console.log('❓ 未知错误类型');
        }
      } else if (error.request) {
        console.log('🌐 网络错误: 请求发送但无响应');
        console.log('🔍 可能的原因:');
        console.log('   - 后端服务崩溃');
        console.log('   - 路由配置错误');
        console.log('   - 中间件阻塞');
      } else {
        console.log('❓ 未知错误:', error.message);
      }
    }
    
    // 3. 检查路由配置
    console.log('\n3️⃣ 检查路由配置...');
    
    try {
      // 测试根路径
      const rootResponse = await axios.get(`${backendUrl}/`, { timeout: 5000 });
      console.log('✅ 根路径可访问');
    } catch (error) {
      console.log('❌ 根路径不可访问');
    }
    
    try {
      // 测试API路径
      const apiResponse = await axios.get(`${backendUrl}/api`, { timeout: 5000 });
      console.log('✅ API路径可访问');
    } catch (error) {
      console.log('❌ API路径不可访问');
    }
    
    // 4. 提供诊断建议
    console.log('\n4️⃣ 诊断建议:');
    console.log('🔍 如果接口无响应，请检查:');
    console.log('1. 后端服务日志 - docker logs threadbond-backend');
    console.log('2. 路由是否正确注册');
    console.log('3. 中间件是否有阻塞');
    console.log('4. 邮件服务配置是否正确');
    console.log('5. 数据库连接是否正常');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 检查后端服务进程
async function checkBackendProcess() {
  console.log('\n🔍 检查后端服务进程...');
  
  const { spawn } = require('child_process');
  
  // 检查端口3000是否被占用
  const netstat = spawn('netstat', ['-an'], { shell: true });
  
  let output = '';
  netstat.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  netstat.on('close', (code) => {
    if (output.includes(':3000')) {
      console.log('✅ 端口3000正在被使用');
    } else {
      console.log('❌ 端口3000未被使用');
      console.log('💡 请启动后端服务');
    }
  });
}

// 测试其他API接口
async function testOtherAPIs() {
  console.log('\n🧪 测试其他API接口...');
  
  const backendUrl = 'http://localhost:3000';
  
  const testAPIs = [
    { method: 'GET', url: '/health', name: '健康检查' },
    { method: 'POST', url: '/api/auth/check-email', name: '邮箱检查', data: { email: 'test@example.com' } }
  ];
  
  for (const api of testAPIs) {
    try {
      console.log(`📡 测试 ${api.name}: ${api.method} ${api.url}`);
      
      let response;
      if (api.method === 'GET') {
        response = await axios.get(`${backendUrl}${api.url}`, { timeout: 5000 });
      } else {
        response = await axios.post(`${backendUrl}${api.url}`, api.data || {}, { timeout: 5000 });
      }
      
      console.log(`✅ ${api.name} 正常响应`);
      
    } catch (error) {
      console.log(`❌ ${api.name} 响应失败:`, error.response?.status || error.code);
    }
  }
}

// 运行测试
if (require.main === module) {
  console.log('🚀 开始测试验证码发送接口...');
  console.log('=====================================');
  
  testVerificationAPI()
    .then(() => {
      checkBackendProcess();
      return testOtherAPIs();
    })
    .then(() => {
      console.log('\n✅ 测试完成');
    })
    .catch(error => {
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testVerificationAPI };