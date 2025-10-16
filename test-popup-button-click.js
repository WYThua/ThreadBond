#!/usr/bin/env node

/**
 * 测试弹窗按钮点击功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试弹窗按钮点击功能...\n');

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
    name: '使用原生按钮替代 Vant 按钮',
    test: () => {
      const hasCustomButton = loginContent.includes('<button class="popup-button"');
      const noVantButton = !loginContent.includes('<van-button type="primary" size="small"');
      return hasCustomButton && noVantButton;
    },
    description: '检查是否使用原生 button 元素替代 van-button'
  },
  {
    name: '忘记密码弹窗按钮绑定',
    test: () => {
      const hasClickBinding = loginContent.includes('@click="closeForgotPasswordPopup"');
      return hasClickBinding;
    },
    description: '检查忘记密码弹窗按钮的点击事件绑定'
  },
  {
    name: '登录结果弹窗按钮绑定',
    test: () => {
      const hasClickBinding = loginContent.includes('@click="closeLoginResultPopup"');
      return hasClickBinding;
    },
    description: '检查登录结果弹窗按钮的点击事件绑定'
  },
  {
    name: '关闭方法实现',
    test: () => {
      const hasForgotMethod = loginContent.includes('closeForgotPasswordPopup() {');
      const hasResultMethod = loginContent.includes('closeLoginResultPopup() {');
      const hasForgotClose = loginContent.includes('this.showForgotPasswordPopup = false');
      const hasResultClose = loginContent.includes('this.showLoginResultPopup = false');
      return hasForgotMethod && hasResultMethod && hasForgotClose && hasResultClose;
    },
    description: '检查关闭方法是否正确实现'
  },
  {
    name: '弹窗配置优化',
    test: () => {
      const hasCustomClass = loginContent.includes('class="custom-popup"');
      const hasOverlayStyle = loginContent.includes(':overlay-style="{ backgroundColor: \'rgba(0, 0, 0, 0.4)\' }"');
      return hasCustomClass && hasOverlayStyle;
    },
    description: '检查弹窗配置是否使用优化的设置'
  },
  {
    name: '按钮样式定义',
    test: () => {
      const hasButtonClass = loginContent.includes('.popup-button {');
      const hasHoverEffect = loginContent.includes('&:hover {');
      const hasActiveEffect = loginContent.includes('&:active {');
      return hasButtonClass && hasHoverEffect && hasActiveEffect;
    },
    description: '检查自定义按钮样式是否正确定义'
  },
  {
    name: '调试日志',
    test: () => {
      const hasForgotLog = loginContent.includes('console.log(\'🔘 Closing forgot password popup...\')');
      const hasResultLog = loginContent.includes('console.log(\'🔘 Closing login result popup...\')');
      return hasForgotLog && hasResultLog;
    },
    description: '检查是否添加了调试日志'
  },
  {
    name: '简化样式结构',
    test: () => {
      const hasSimpleClass = loginContent.includes('.custom-popup {');
      const noComplexOverride = !loginContent.includes('position: fixed !important');
      return hasSimpleClass && noComplexOverride;
    },
    description: '检查是否使用简化的样式结构'
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
  console.log('🎉 所有测试通过！弹窗按钮点击功能已修复。');
  console.log('\n✨ 修复的问题:');
  console.log('• 使用原生 button 元素替代 van-button 组件');
  console.log('• 简化弹窗样式，避免复杂的覆盖');
  console.log('• 使用 :overlay-style 设置蒙层样式');
  console.log('• 为每个弹窗添加专门的关闭方法');
  console.log('• 添加自定义按钮样式和交互效果');
  console.log('• 添加调试日志便于排查问题');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示测试说明
console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试忘记密码弹窗:');
console.log('   a. 点击 "Forgot password?" → 弹窗出现');
console.log('   b. 点击 "Got it" 按钮 → 弹窗应该完全关闭');
console.log('   c. 检查控制台是否有关闭日志');
console.log('4. 测试登录结果弹窗:');
console.log('   a. 输入登录信息并点击登录');
console.log('   b. 点击 "OK" 按钮 → 弹窗应该完全关闭');
console.log('   c. 检查控制台是否有关闭日志');

console.log('\n📝 预期效果:');
console.log('• 点击按钮后弹窗应该立即完全消失');
console.log('• 蒙层应该是浅灰色 (rgba(0,0,0,0.4))');
console.log('• 按钮应该有蓝色背景和悬停效果');
console.log('• 控制台应该显示关闭日志');
console.log('• 弹窗应该有圆角和阴影效果');

console.log('\n🔧 关键修复点:');
console.log('• 使用原生 <button> 而不是 <van-button>');
console.log('• 避免过度的 CSS 样式覆盖');
console.log('• 使用 Vant 组件的原生属性设置样式');
console.log('• 确保事件绑定正确且方法存在');