#!/usr/bin/env node

/**
 * 测试不显示状态码相关的错误消息
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试不显示状态码相关的错误消息...\n');

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
    name: '过滤状态码消息',
    test: () => {
      const hasStatusCodeFilter = loginContent.includes('!error.message.includes(\'status code\')');
      const hasRequestFailedFilter = loginContent.includes('!error.message.includes(\'Request failed\')');
      return hasStatusCodeFilter && hasRequestFailedFilter;
    },
    description: '检查是否过滤了包含状态码的错误消息'
  },
  {
    name: '过滤后端状态码消息',
    test: () => {
      const hasBackendStatusFilter = loginContent.includes('!data.message.includes(\'status code\')');
      const hasBackendRequestFilter = loginContent.includes('!data.message.includes(\'Request failed with\')');
      return hasBackendStatusFilter && hasBackendRequestFilter;
    },
    description: '检查是否过滤了后端返回的状态码消息'
  },
  {
    name: '优先使用友好的后端消息',
    test: () => {
      const hasPriorityCheck = loginContent.includes('if (data?.message && !data.message.includes(\'status code\')');
      return hasPriorityCheck;
    },
    description: '检查是否优先使用友好的后端消息'
  },
  {
    name: '默认友好错误消息',
    test: () => {
      const hasDefaultUnexpected = loginContent.includes('An unexpected error occurred. Please try again.');
      const hasDefaultRequest = loginContent.includes('Request failed. Please try again.');
      return hasDefaultUnexpected && hasDefaultRequest;
    },
    description: '检查默认错误消息是否友好'
  },
  {
    name: '具体的HTTP错误处理',
    test: () => {
      const has401Message = loginContent.includes('Invalid email or password. Please check your credentials and try again.');
      const has400Message = loginContent.includes('Invalid request. Please check your input and try again.');
      const has429Message = loginContent.includes('Too many login attempts. Please wait a moment and try again.');
      const has500Message = loginContent.includes('Server error. Please try again later or contact support.');
      return has401Message && has400Message && has429Message && has500Message;
    },
    description: '检查具体HTTP错误是否有友好消息'
  },
  {
    name: '网络错误友好消息',
    test: () => {
      const hasNetworkError = loginContent.includes('Network connection failed. Please check your internet connection and try again.');
      const hasConnectionError = loginContent.includes('Cannot connect to server. Please check if the service is running.');
      const hasTimeoutError = loginContent.includes('Request timed out. Please check your connection and try again.');
      return hasNetworkError && hasConnectionError && hasTimeoutError;
    },
    description: '检查网络错误是否有友好消息'
  },
  {
    name: '避免技术术语',
    test: () => {
      // 检查代码中是否避免了在用户消息中显示技术术语
      const lines = loginContent.split('\n');
      const errorMessageLines = lines.filter(line => 
        line.includes('errorMessage =') && 
        !line.includes('//') && 
        !line.includes('console.')
      );
      
      const hasTechnicalTerms = errorMessageLines.some(line => 
        line.includes('status ${') || 
        line.includes('code ${') ||
        line.includes('HTTP') ||
        line.includes('${status}')
      );
      
      return !hasTechnicalTerms;
    },
    description: '检查用户消息中是否避免了技术术语'
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
  console.log('🎉 所有测试通过！已成功移除状态码相关的错误消息。');
  console.log('\n✨ 实现的改进:');
  console.log('• 过滤掉包含 "status code" 的错误消息');
  console.log('• 过滤掉包含 "Request failed with" 的错误消息');
  console.log('• 优先使用后端返回的友好消息');
  console.log('• 为每种错误类型提供具体的友好消息');
  console.log('• 避免在用户界面显示技术术语');
  console.log('• 提供可操作的解决建议');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示过滤逻辑
console.log('\n🔧 过滤逻辑:');
console.log('1. 检查错误消息是否包含技术术语');
console.log('2. 如果包含状态码相关内容，使用默认友好消息');
console.log('3. 优先使用后端返回的友好消息');
console.log('4. 根据错误类型提供具体的用户指导');

console.log('\n🚫 被过滤的消息类型:');
console.log('• "Request failed with status code 401"');
console.log('• "Request failed with status code 500"');
console.log('• 任何包含 "status code" 的消息');
console.log('• 任何包含 "Request failed with" 的消息');

console.log('\n✅ 替换后的友好消息:');
console.log('• 401 → "Invalid email or password. Please check your credentials and try again."');
console.log('• 400 → "Invalid request. Please check your input and try again."');
console.log('• 429 → "Too many login attempts. Please wait a moment and try again."');
console.log('• 500 → "Server error. Please try again later or contact support."');
console.log('• 网络错误 → "Network connection failed. Please check your internet connection and try again."');
console.log('• 其他错误 → "An unexpected error occurred. Please try again."');

console.log('\n🧪 测试建议:');
console.log('1. 启动应用并尝试登录失败场景');
console.log('2. 检查弹窗中是否不再显示状态码');
console.log('3. 验证错误消息是否用户友好');
console.log('4. 确认每个错误都有具体的解决建议');