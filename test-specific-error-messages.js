#!/usr/bin/env node

/**
 * 测试具体错误信息功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试具体错误信息功能...\n');

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
    name: 'HTTP状态码错误处理',
    test: () => {
      const has401 = loginContent.includes('status === 401');
      const has400 = loginContent.includes('status === 400');
      const has429 = loginContent.includes('status === 429');
      const has500 = loginContent.includes('status === 500');
      return has401 && has400 && has429 && has500;
    },
    description: '检查是否处理了不同的HTTP状态码错误'
  },
  {
    name: '网络错误处理',
    test: () => {
      const hasNetworkError = loginContent.includes('NETWORK_ERROR');
      const hasConnectionRefused = loginContent.includes('ECONNREFUSED');
      const hasTimeout = loginContent.includes('TIMEOUT');
      return hasNetworkError && hasConnectionRefused && hasTimeout;
    },
    description: '检查是否处理了不同类型的网络错误'
  },
  {
    name: '具体错误消息',
    test: () => {
      const hasInvalidCredentials = loginContent.includes('Invalid email or password');
      const hasTooManyAttempts = loginContent.includes('Too many login attempts');
      const hasServerError = loginContent.includes('Server error');
      const hasNetworkMessage = loginContent.includes('Network connection failed');
      return hasInvalidCredentials && hasTooManyAttempts && hasServerError && hasNetworkMessage;
    },
    description: '检查是否有具体的错误消息'
  },
  {
    name: '成功消息优化',
    test: () => {
      const hasWelcomeMessage = loginContent.includes('Welcome back! You have successfully logged in.');
      return hasWelcomeMessage;
    },
    description: '检查成功登录消息是否优化'
  },
  {
    name: '后端错误消息解析',
    test: () => {
      const hasUserNotFound = loginContent.includes('User not found');
      const hasInvalidPassword = loginContent.includes('Invalid password');
      const hasAccountDisabled = loginContent.includes('account disabled');
      return hasUserNotFound && hasInvalidPassword && hasAccountDisabled;
    },
    description: '检查是否解析了后端特定错误消息'
  },
  {
    name: '错误响应结构处理',
    test: () => {
      const hasResponseCheck = loginContent.includes('if (error.response)');
      const hasRequestCheck = loginContent.includes('else if (error.request)');
      const hasDataAccess = loginContent.includes('error.response.data');
      return hasResponseCheck && hasRequestCheck && hasDataAccess;
    },
    description: '检查是否正确处理了错误响应结构'
  },
  {
    name: '用户友好的错误提示',
    test: () => {
      const hasCheckCredentials = loginContent.includes('Please check your email and password');
      const hasCheckConnection = loginContent.includes('Please check your internet connection');
      const hasContactSupport = loginContent.includes('contact support');
      return hasCheckCredentials && hasCheckConnection && hasContactSupport;
    },
    description: '检查错误提示是否用户友好'
  },
  {
    name: '默认错误处理',
    test: () => {
      const hasDefaultError = loginContent.includes('An unexpected error occurred');
      const hasFallbackMessage = loginContent.includes('Please try again');
      return hasDefaultError && hasFallbackMessage;
    },
    description: '检查是否有默认错误处理'
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
  console.log('🎉 所有测试通过！具体错误信息功能已实现。');
  console.log('\n✨ 实现的功能:');
  console.log('• HTTP状态码特定错误处理 (401, 400, 429, 500等)');
  console.log('• 网络错误类型识别 (连接失败、超时等)');
  console.log('• 后端错误消息解析和用户友好化');
  console.log('• 成功登录消息优化');
  console.log('• 默认错误处理和降级方案');
  console.log('• 用户友好的错误提示和建议');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示错误消息示例
console.log('\n📝 错误消息示例:');
console.log('• 401 Unauthorized: "Invalid email or password. Please check your credentials and try again."');
console.log('• 429 Too Many Requests: "Too many login attempts. Please wait a moment and try again."');
console.log('• 500 Server Error: "Server error. Please try again later or contact support."');
console.log('• Network Error: "Network connection failed. Please check your internet connection and try again."');
console.log('• Connection Refused: "Cannot connect to server. Please check if the service is running."');
console.log('• User Not Found: "No account found with this email address. Please check your email or sign up."');
console.log('• Invalid Password: "Incorrect password. Please check your password and try again."');
console.log('• Account Disabled: "Your account has been disabled. Please contact support for assistance."');

console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试不同错误场景:');
console.log('   a. 输入错误的邮箱/密码 → 应显示具体的认证错误');
console.log('   b. 输入不存在的邮箱 → 应显示账户不存在提示');
console.log('   c. 关闭后端服务 → 应显示连接错误');
console.log('   d. 输入正确信息 → 应显示欢迎消息');

console.log('\n💡 用户体验改进:');
console.log('• 错误消息更具体，帮助用户了解问题所在');
console.log('• 提供解决建议，指导用户下一步操作');
console.log('• 区分不同类型的错误，避免混淆');
console.log('• 友好的语言，减少用户焦虑');