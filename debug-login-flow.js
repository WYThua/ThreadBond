#!/usr/bin/env node

/**
 * 调试登录流程
 */

console.log('🔍 调试登录流程...\n');

// 检查关键文件
const files = [
  'frontend/src/views/auth/Login.vue',
  'frontend/src/store/modules/auth.js',
  'frontend/src/api/auth.js'
];

const fs = require('fs');
const path = require('path');

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📋 检查登录页面关键代码...\n');

const loginFile = path.join(__dirname, 'frontend/src/views/auth/Login.vue');
const loginContent = fs.readFileSync(loginFile, 'utf8');

// 检查关键代码片段
const checks = [
  {
    name: '表单提交绑定',
    pattern: '@submit="handleLogin"',
    found: loginContent.includes('@submit="handleLogin"')
  },
  {
    name: '登录方法定义',
    pattern: 'async handleLogin()',
    found: loginContent.includes('async handleLogin()')
  },
  {
    name: 'Vuex action调用',
    pattern: 'await this.login({',
    found: loginContent.includes('await this.login({')
  },
  {
    name: '表单数据传递',
    pattern: 'email: this.form.email',
    found: loginContent.includes('email: this.form.email')
  },
  {
    name: '密码数据传递',
    pattern: 'password: this.form.password',
    found: loginContent.includes('password: this.form.password')
  },
  {
    name: '结果处理',
    pattern: 'this.loginResult =',
    found: loginContent.includes('this.loginResult =')
  }
];

checks.forEach(check => {
  console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
});

console.log('\n🧪 建议的调试步骤:');
console.log('1. 打开浏览器开发者工具');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 在 handleLogin 方法开始处添加 console.log');
console.log('4. 检查网络面板是否有 API 请求');
console.log('5. 查看控制台是否有错误信息');

console.log('\n💡 可能的问题:');
console.log('• 表单验证失败，提前返回');
console.log('• Vuex store 未正确导入');
console.log('• API 请求被拦截或失败');
console.log('• 网络连接问题');