#!/usr/bin/env node

/**
 * 测试弹窗层级修复
 * 验证弹窗是否正确显示在最上层
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试弹窗层级修复...\n');

// 读取登录页面文件
const loginFilePath = path.join(__dirname, 'frontend/src/views/auth/Login.vue');

if (!fs.existsSync(loginFilePath)) {
  console.error('❌ 登录页面文件不存在:', loginFilePath);
  process.exit(1);
}

const loginContent = fs.readFileSync(loginFilePath, 'utf8');

// 测试项目
const tests = [
  {
    name: '弹窗 z-index 属性',
    test: () => {
      const hasForgotPasswordZIndex = loginContent.includes(':z-index="9999"');
      const hasLoginResultZIndex = loginContent.includes(':z-index="10000"');
      return hasForgotPasswordZIndex && hasLoginResultZIndex;
    },
    description: '检查弹窗是否设置了正确的 z-index 值'
  },
  {
    name: '弹窗遮罩层配置',
    test: () => {
      const hasOverlayClass = loginContent.includes('overlay-class="popup-overlay"');
      const hasLockScroll = loginContent.includes('lock-scroll');
      return hasOverlayClass && hasLockScroll;
    },
    description: '检查弹窗是否配置了遮罩层和滚动锁定'
  },
  {
    name: '全局样式覆盖',
    test: () => {
      const hasDeepSelector = loginContent.includes(':deep(.forgot-password-popup)');
      const hasZIndexOverride = loginContent.includes('z-index: 10000 !important');
      return hasDeepSelector && hasZIndexOverride;
    },
    description: '检查是否使用深度选择器覆盖组件样式'
  },
  {
    name: '遮罩层样式',
    test: () => {
      const hasOverlayStyle = loginContent.includes(':deep(.popup-overlay)');
      const hasOverlayZIndex = loginContent.includes('z-index: 9999 !important');
      const hasOverlayBackground = loginContent.includes('background-color: rgba(0, 0, 0, 0.7)');
      return hasOverlayStyle && hasOverlayZIndex && hasOverlayBackground;
    },
    description: '检查遮罩层样式是否正确设置'
  },
  {
    name: '弹窗内容样式优化',
    test: () => {
      const hasMinWidth = loginContent.includes('min-width: 280px');
      const hasMaxWidth = loginContent.includes('max-width: 90vw');
      const hasWordWrap = loginContent.includes('word-wrap: break-word');
      return hasMinWidth && hasMaxWidth && hasWordWrap;
    },
    description: '检查弹窗内容样式是否优化'
  },
  {
    name: '成功/失败状态样式',
    test: () => {
      const hasSuccessClass = loginContent.includes('&.success {');
      const hasErrorClass = loginContent.includes('&.error {');
      const hasClassBinding = loginContent.includes(':class="{ success: loginResult.success, error: !loginResult.success }"');
      return hasSuccessClass && hasErrorClass && hasClassBinding;
    },
    description: '检查成功/失败状态的样式类是否正确绑定'
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
  console.log('🎉 所有测试通过！弹窗层级问题已修复。');
  console.log('\n✨ 修复内容:');
  console.log('• 设置弹窗 z-index 为 10000，确保显示在最上层');
  console.log('• 设置遮罩层 z-index 为 9999，确保正确覆盖');
  console.log('• 添加 lock-scroll 属性，防止背景滚动');
  console.log('• 使用深度选择器覆盖组件默认样式');
  console.log('• 优化弹窗内容样式，支持响应式设计');
  console.log('• 添加成功/失败状态的视觉区分');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示测试说明
console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试弹窗层级:');
console.log('   a. 点击 "Forgot password?" 链接，观察弹窗是否在最上层');
console.log('   b. 关闭忘记密码弹窗');
console.log('   c. 输入登录信息并点击登录，观察结果弹窗是否在最上层');
console.log('   d. 检查弹窗是否有正确的遮罩层');
console.log('   e. 验证弹窗内容是否完整显示');

console.log('\n📝 预期结果:');
console.log('• 弹窗应该显示在页面最上层，不被其他元素遮挡');
console.log('• 弹窗应该有半透明的黑色遮罩层');
console.log('• 弹窗打开时应该锁定背景滚动');
console.log('• 成功/失败弹窗应该有不同的颜色标识');
console.log('• 弹窗内容应该完整显示，支持长文本换行');