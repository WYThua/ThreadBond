#!/usr/bin/env node

/**
 * 测试表单验证功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试表单验证功能...\n');

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
    name: '错误提示显示逻辑',
    test: () => {
      const hasEmailError = loginContent.includes('v-if="errors.email"');
      const hasPasswordError = loginContent.includes('v-if="errors.password"');
      return hasEmailError && hasPasswordError;
    },
    description: '检查错误提示是否在有错误时显示'
  },
  {
    name: '实时验证事件绑定',
    test: () => {
      const hasEmailBlur = loginContent.includes('@blur="validateEmail"');
      const hasPasswordBlur = loginContent.includes('@blur="validatePassword"');
      const hasEmailInput = loginContent.includes('@input="clearEmailError"');
      const hasPasswordInput = loginContent.includes('@input="clearPasswordError"');
      return hasEmailBlur && hasPasswordBlur && hasEmailInput && hasPasswordInput;
    },
    description: '检查是否绑定了实时验证事件'
  },
  {
    name: '单独验证方法',
    test: () => {
      const hasValidateEmail = loginContent.includes('validateEmail()');
      const hasValidatePassword = loginContent.includes('validatePassword()');
      return hasValidateEmail && hasValidatePassword;
    },
    description: '检查是否有单独的字段验证方法'
  },
  {
    name: '错误清除方法',
    test: () => {
      const hasClearEmailError = loginContent.includes('clearEmailError()');
      const hasClearPasswordError = loginContent.includes('clearPasswordError()');
      return hasClearEmailError && hasClearPasswordError;
    },
    description: '检查是否有错误清除方法'
  },
  {
    name: '表单整体验证',
    test: () => {
      const hasFormValidation = loginContent.includes('validateForm()');
      const hasValidationCall = loginContent.includes('this.validateEmail()');
      const hasPasswordValidationCall = loginContent.includes('this.validatePassword()');
      return hasFormValidation && hasValidationCall && hasPasswordValidationCall;
    },
    description: '检查表单整体验证逻辑'
  },
  {
    name: '英文错误消息',
    test: () => {
      const hasEmailRequired = loginContent.includes('Please enter your email address');
      const hasEmailFormat = loginContent.includes('Invalid email format');
      const hasPasswordRequired = loginContent.includes('Please enter your password');
      const hasPasswordLength = loginContent.includes('Password must be at least 6 characters');
      return hasEmailRequired && hasEmailFormat && hasPasswordRequired && hasPasswordLength;
    },
    description: '检查是否使用英文错误消息'
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
  console.log('🎉 所有测试通过！表单验证功能已完善。');
  console.log('\n✨ 实现的功能:');
  console.log('• 实时邮箱格式验证');
  console.log('• 实时密码长度验证');
  console.log('• 输入时自动清除错误提示');
  console.log('• 失焦时进行字段验证');
  console.log('• 提交时进行完整表单验证');
  console.log('• 英文错误提示信息');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示测试说明
console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试验证功能:');
console.log('   a. 输入无效邮箱格式，点击其他地方 → 应显示格式错误');
console.log('   b. 输入少于6位密码，点击其他地方 → 应显示长度错误');
console.log('   c. 开始输入正确内容 → 错误提示应自动消失');
console.log('   d. 留空字段并点击登录 → 应显示必填错误');

console.log('\n📝 预期行为:');
console.log('• 邮箱格式错误时显示 "Invalid email format"');
console.log('• 密码少于6位时显示 "Password must be at least 6 characters"');
console.log('• 字段为空时显示相应的必填提示');
console.log('• 开始输入时错误提示自动消失');
console.log('• 失焦时立即验证并显示错误');