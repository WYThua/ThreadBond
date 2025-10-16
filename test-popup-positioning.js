#!/usr/bin/env node

/**
 * 测试弹窗定位和背景样式
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试弹窗定位和背景样式...\n');

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
    name: '弹窗绝对定位',
    test: () => {
      const hasFixedPosition = loginContent.includes('position: fixed !important');
      const hasFullViewport = loginContent.includes('width: 100vw !important') && 
                              loginContent.includes('height: 100vh !important');
      const hasTopLeft = loginContent.includes('top: 0 !important') && 
                         loginContent.includes('left: 0 !important');
      return hasFixedPosition && hasFullViewport && hasTopLeft;
    },
    description: '检查弹窗是否使用绝对定位覆盖整个视口'
  },
  {
    name: '弹窗居中对齐',
    test: () => {
      const hasFlexDisplay = loginContent.includes('display: flex !important');
      const hasAlignCenter = loginContent.includes('align-items: center !important');
      const hasJustifyCenter = loginContent.includes('justify-content: center !important');
      return hasFlexDisplay && hasAlignCenter && hasJustifyCenter;
    },
    description: '检查弹窗是否使用 Flexbox 居中对齐'
  },
  {
    name: '弹窗背景色',
    test: () => {
      const hasWhiteBackground = loginContent.includes('background: white !important');
      const hasBorderRadius = loginContent.includes('border-radius: 12px !important');
      const hasBoxShadow = loginContent.includes('box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important');
      return hasWhiteBackground && hasBorderRadius && hasBoxShadow;
    },
    description: '检查弹窗是否有白色背景和阴影效果'
  },
  {
    name: '遮罩层样式',
    test: () => {
      const hasOverlayPosition = loginContent.includes('position: fixed !important');
      const hasOverlayBackground = loginContent.includes('background-color: rgba(0, 0, 0, 0.7) !important');
      const hasBackdropFilter = loginContent.includes('backdrop-filter: blur(2px) !important');
      return hasOverlayPosition && hasOverlayBackground && hasBackdropFilter;
    },
    description: '检查遮罩层是否有正确的背景和模糊效果'
  },
  {
    name: '层级设置',
    test: () => {
      const hasPopupZIndex = loginContent.includes('z-index: 10000 !important');
      const hasContentZIndex = loginContent.includes('z-index: 10001 !important');
      const hasOverlayZIndex = loginContent.includes('z-index: 9999 !important');
      return hasPopupZIndex && hasContentZIndex && hasOverlayZIndex;
    },
    description: '检查弹窗和遮罩层的 z-index 层级设置'
  },
  {
    name: '响应式设计',
    test: () => {
      const hasMaxWidth = loginContent.includes('max-width: 90vw !important');
      const hasMaxHeight = loginContent.includes('max-height: 90vh !important');
      const hasOverflowHidden = loginContent.includes('overflow: hidden !important');
      return hasMaxWidth && hasMaxHeight && hasOverflowHidden;
    },
    description: '检查弹窗是否支持响应式设计'
  },
  {
    name: '按钮样式优化',
    test: () => {
      const hasButtonBackground = loginContent.includes('background: #1989fa');
      const hasButtonHover = loginContent.includes('&:hover {');
      const hasButtonTransition = loginContent.includes('transition: all 0.3s ease');
      return hasButtonBackground && hasButtonHover && hasButtonTransition;
    },
    description: '检查按钮是否有优化的样式和交互效果'
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
  console.log('🎉 所有测试通过！弹窗定位和背景样式已优化。');
  console.log('\n✨ 实现的功能:');
  console.log('• 弹窗使用绝对定位覆盖整个视口');
  console.log('• 使用 Flexbox 实现完美居中');
  console.log('• 白色背景和圆角边框');
  console.log('• 阴影效果增强视觉层次');
  console.log('• 半透明遮罩层和模糊效果');
  console.log('• 正确的 z-index 层级管理');
  console.log('• 响应式设计适配各种屏幕');
  console.log('• 优化的按钮交互效果');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示测试说明
console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试弹窗显示:');
console.log('   a. 点击 "Forgot password?" → 观察弹窗是否正确显示');
console.log('   b. 关闭忘记密码弹窗');
console.log('   c. 输入登录信息并点击登录 → 观察结果弹窗');
console.log('   d. 检查弹窗是否有白色背景和阴影');
console.log('   e. 验证遮罩层是否有半透明效果');

console.log('\n📝 预期效果:');
console.log('• 弹窗应该完美居中显示在页面中央');
console.log('• 弹窗应该有白色背景和圆角边框');
console.log('• 弹窗应该有阴影效果增强立体感');
console.log('• 遮罩层应该有半透明黑色背景');
console.log('• 遮罩层应该有轻微的模糊效果');
console.log('• 弹窗在各种屏幕尺寸下都能正确显示');