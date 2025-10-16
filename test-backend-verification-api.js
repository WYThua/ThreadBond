/**
 * 测试后端验证码 API
 * 检查后端服务是否正常运行以及验证码接口是否可用
 */

const axios = require('axios');

async function testBackendVerificationAPI() {
  console.log('🔍 测试后端验证码 API...\n');

  const baseURL = 'http://localhost:3000';

  try {
    // 测试1: 检查后端服务是否运行
    console.log('🏥 测试1: 检查后端服务健康状态');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ 后端服务正常运行');
      console.log('服务信息:', healthResponse.data);
    } catch (error) {
      console.log('❌ 后端服务未运行或无法访问');
      console.log('错误:', error.message);
      return;
    }

    // 测试2: 检查根路径
    console.log('\n🏠 测试2: 检查根路径');
    try {
      const rootResponse = await axios.get(`${baseURL}/`);
      console.log('✅ 根路径正常');
      console.log('API 端点:', rootResponse.data.endpoints);
    } catch (error) {
      console.log('❌ 根路径访问失败:', error.message);
    }

    // 测试3: 检查认证路由是否存在
    console.log('\n🔐 测试3: 检查认证路由');
    try {
      // 尝试访问一个已知的认证端点（登出）
      const logoutResponse = await axios.post(`${baseURL}/api/auth/logout`);
      console.log('✅ 认证路由正常工作');
      console.log('登出响应:', logoutResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('✅ 认证路由存在（收到响应）');
        console.log('响应状态:', error.response.status);
        console.log('响应数据:', error.response.data);
      } else {
        console.log('❌ 认证路由不存在或网络错误:', error.message);
      }
    }

    // 测试4: 测试发送验证码接口
    console.log('\n📧 测试4: 测试发送验证码接口');
    try {
      const sendCodeResponse = await axios.post(`${baseURL}/api/auth/send-verification-code`, {
        email: 'test@example.com'
      });
      console.log('✅ 发送验证码接口正常工作');
      console.log('响应:', sendCodeResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ 发送验证码接口返回错误');
        console.log('状态码:', error.response.status);
        console.log('错误信息:', error.response.data);
      } else {
        console.log('❌ 发送验证码接口网络错误:', error.message);
      }
    }

    // 测试5: 测试无效请求
    console.log('\n🚫 测试5: 测试无效请求');
    try {
      const invalidResponse = await axios.post(`${baseURL}/api/auth/send-verification-code`, {
        // 缺少 email 字段
      });
      console.log('❌ 应该返回错误但成功了:', invalidResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 无效请求正确被拒绝');
        console.log('错误信息:', error.response.data.message);
      } else {
        console.log('❌ 意外错误:', error.message);
      }
    }

    // 测试6: 检查所有认证相关端点
    console.log('\n📋 测试6: 检查所有认证端点');
    const authEndpoints = [
      '/api/auth/register',
      '/api/auth/login', 
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/auth/send-verification-code',
      '/api/auth/check-email'
    ];

    for (const endpoint of authEndpoints) {
      try {
        // 使用 OPTIONS 请求检查端点是否存在
        const response = await axios.options(`${baseURL}${endpoint}`);
        console.log(`✅ ${endpoint} - 端点存在`);
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.log(`✅ ${endpoint} - 端点存在（非404错误）`);
        } else {
          console.log(`❌ ${endpoint} - 端点不存在或无法访问`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }

  console.log('\n✅ 后端验证码 API 测试完成');
}

// 检查后端编译状态
function checkBackendCompilation() {
  console.log('🔧 后端服务启动建议:');
  console.log('1. 确保后端服务正在运行:');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('2. 如果有编译错误，请检查:');
  console.log('   - TypeScript 编译错误');
  console.log('   - 缺少依赖包');
  console.log('   - 环境变量配置');
  console.log('');
  console.log('3. 重新启动后端服务:');
  console.log('   - 停止当前服务 (Ctrl+C)');
  console.log('   - 重新运行 npm run dev');
  console.log('');
}

// 主函数
async function main() {
  console.log('🔍 后端验证码 API 测试');
  console.log('=====================================\n');

  checkBackendCompilation();
  
  await testBackendVerificationAPI();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBackendVerificationAPI };