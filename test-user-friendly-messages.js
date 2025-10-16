#!/usr/bin/env node

/**
 * 测试用户友好的错误消息（不显示状态码）
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试用户友好的错误消息...\n');

// 读取登录页面文件
const loginFilePath = path.join(__dirname, 'frontend/src/views/auth/Login.vue');

if (!fs.existsSync(loginFilePath)) {
  console.error('❌ 登录页面文件不存在');
  process.exit(1);
}

const loginContent = fs.readFileSync(loginFilePath, 'utf8');

// 测试项目
const tests = [
  {
    name: '移除状态码显示',
    test: () => {
      // 检查是否不再显示状态码
      const noStatusCodeDisplay = !loginContent.includes('status ${status}');
      const hasGenericMessage = loginContent.includes('Request failed. Please try again.');
      return noStatusCodeDisplay && hasGenericMessage;
    },
    description: '检查是否移除了状态码的显示'
  },
  {
    name: '用户友好的认证错误',
    test: () => {
      const hasInvalidCredentials = loginContent.includes('Invalid email or password. Please check your credentials and try again.');
      return hasInvalidCredentials;
    },
    description: '检查认证错误是否用户友好'
  },
  {
    name: '用户友好的请求错误',
    test: () => {
      const hasInvalidRequest = loginContent.includes('Invalid request. Please check your input and try again.');
      return hasInvalidRequest;
    },
    description: '检查请求错误是否用户友好'
  },
  {
    name: '用户友好的限流错误',
    test: () => {
      const hasTooManyAttempts = loginContent.includes('Too many login attempts. Please wait a moment and try again.');
      return hasTooManyAttempts;
    },
    description: '检查限流错误是否用户友好'
  },
  {
    name: '用户友好的服务器错误',
    test: () => {
      const hasServerError = loginContent.includes('Server error. Please try again later or contact support.');
      const hasServerUnavailable = loginContent.includes('Server is temporarily unavailable. Please try again later.');
      return hasServerError && hasServerUnavailable;
    },
    description: '检查服务器错误是否用户友好'
  },
  {
    name: '用户友好的网络错误',
    test: () => {
      const hasNetworkError = loginContent.includes('Network connection failed. Please check your internet connection and try again.');
      const hasConnectionError = loginContent.includes('Cannot connect to server. Please check if the service is running.');
      const hasTimeoutError = loginContent.includes('Request timed out. Please check your connection and try again.');
      return hasNetworkError && hasConnectionError && hasTimeoutError;
    },
    description: '检查网络错误是否用户友好'
  },
  {
    name: '用户友好的业务错误',
    test: () => {
      const hasUserNotFound = loginContent.includes('No account found with this email address. Please check your email or sign up.');
      const hasInvalidPassword = loginContent.includes('Incorrect password. Please check your password and try again.');
      const hasAccountDisabled = loginContent.includes('Your account has been disabled. Please contact support for assistance.');
      return hasUserNotFound && hasInvalidPassword && hasAccountDisabled;
    },
    description: '检查业务错误是否用户友好'
  },
  {
    name: '用户友好的成功消息',
    test: () => {
      const hasWelcomeMessage = loginContent.includes('Welcome back! You have successfully logged in.');
      return hasWelcomeMessage;
    },
    description: '检查成功消息是否用户友好'
  },
  {
    name: '默认友好错误',
    test: () => {
      const hasDefaultError = loginContent.includes('An unexpected error occurred. Please try again.');
      const hasGenericLoginError = loginContent.includes('Login failed. Please check your email and password.');
      return hasDefaultError && hasGenericLoginError;
    },
    description: '检查默认错误消息是否用户友好'
  },
  {
    name: '无技术术语',
    test: () => {
      // 检查是否没有技术术语
      const noHttpStatus = !loginContent.includes('HTTP');
      const noStatusCode = !loginContent.includes('status code');
      const noErrorCode = !loginContent.includes('error code');
      return noHttpStatus && noStatusCode && noErrorCode;
    },
    description: '检查是否避免了技术术语'
  }
];

// 运行测试
let passedTests = 0;
const totalTests = tests.length;

tests.forEach((test, index) => {
  const result = test.test();
  const status = result ? '✅ 通过' : '❌ 失败';
  
  console.log(`${index + 1}. ${test.name}: ${status}`);
  console.log(`   ${test.description}`);
  
  if (result) {
    passedTests++;
  }
  
  console.log('');
});

// 总结
console.log('📊 测试总结:');
console.log(`通过: ${passedTests}/${totalTests}`);
console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%\n`);

if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！用户友好的错误消息已实现。');
  console.log('\n✨ 用户体验特点:');
  console.log('• 不显示技术状态码或错误代码');
  console.log('• 使用简单易懂的语言');
  console.log('• 提供具体的解决建议');
  console.log('• 避免技术术语和专业词汇');
  console.log('• 友好温暖的语调');
  console.log('• 明确的下一步指导');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示用户友好消息示例
console.log('\n📝 用户友好消息示例:');
console.log('✅ 成功: "Welcome back! You have successfully logged in."');
console.log('❌ 认证失败: "Invalid email or password. Please check your credentials and try again."');
console.log('❌ 账户不存在: "No account found with this email address. Please check your email or sign up."');
console.log('❌ 密码错误: "Incorrect password. Please check your password and try again."');
console.log('❌ 账户禁用: "Your account has been disabled. Please contact support for assistance."');
console.log('❌ 请求过多: "Too many login attempts. Please wait a moment and try again."');
console.log('❌ 服务器错误: "Server error. Please try again later or contact support."');
console.log('❌ 网络错误: "Network connection failed. Please check your internet connection and try again."');
console.log('❌ 连接失败: "Cannot connect to server. Please check if the service is running."');
console.log('❌ 请求超时: "Request timed out. Please check your connection and try again."');
console.log('❌ 通用错误: "An unexpected error occurred. Please try again."');

console.log('\n💡 设计原则:');
console.log('• 用户导向: 从用户角度描述问题');
console.log('• 解决导向: 提供具体的解决方案');
console.log('• 简洁明了: 避免冗长的技术解释');
console.log('• 积极正面: 使用积极的语言表达');
console.log('• 一致性: 保持错误消息风格统一');

console.log('\n🚫 避免的内容:');
console.log('• HTTP状态码 (401, 404, 500等)');
console.log('• 技术错误代码');
console.log('• 系统内部术语');
console.log('• 开发者专用词汇');
console.log('• 冷冰冰的系统消息');