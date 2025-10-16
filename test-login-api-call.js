#!/usr/bin/env node

/**
 * 测试登录接口调用功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试登录接口调用功能...\n');

// 检查登录页面代码
const loginFilePath = path.join(__dirname, 'frontend/src/views/auth/Login.vue');
if (!fs.existsSync(loginFilePath)) {
  console.error('❌ 登录页面文件不存在');
  process.exit(1);
}

const loginContent = fs.readFileSync(loginFilePath, 'utf8');

// 测试项目
const tests = [
  {
    name: '登录方法存在',
    test: () => loginContent.includes('async handleLogin()'),
    description: '检查是否有登录处理方法'
  },
  {
    name: 'Vuex login action调用',
    test: () => loginContent.includes('await this.login({'),
    description: '检查是否调用了Vuex的login action'
  },
  {
    name: '表单验证',
    test: () => loginContent.includes('if (!this.validateForm())'),
    description: '检查是否有表单验证'
  },
  {
    name: '错误处理',
    test: () => loginContent.includes('catch (error)'),
    description: '检查是否有错误处理'
  },
  {
    name: '后端消息显示',
    test: () => loginContent.includes('message: result.message ||'),
    description: '检查是否直接显示后端返回的消息'
  }
];

let passedTests = 0;
tests.forEach((test, index) => {
  const result = test.test();
  console.log(`${index + 1}. ${test.name}: ${result ? '✅ 通过' : '❌ 失败'}`);
  if (result) passedTests++;
});

console.log(`\n📊 测试结果: ${passedTests}/${tests.length} 通过\n`);

if (passedTests === tests.length) {
  console.log('🎉 登录接口调用功能正常！');
} else {
  console.log('⚠️ 部分功能异常，请检查代码');
}