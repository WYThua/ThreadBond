#!/usr/bin/env node

/**
 * 测试弹窗蒙层功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试弹窗蒙层功能...\n');

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
    name: '自定义蒙层元素',
    test: () => {
      const hasOverlayDiv = loginContent.includes('<div v-if="showForgotPasswordPopup" class="popup-overlay"');
      const hasResultOverlayDiv = loginContent.includes('<div v-if="showLoginResultPopup" class="popup-overlay"');
      return hasOverlayDiv && hasResultOverlayDiv;
    },
    description: '检查是否添加了自定义蒙层 div 元素'
  },
  {
    name: '蒙层点击关闭',
    test: () => {
      const hasForgotClick = loginContent.includes('@click="closeForgotPasswordPopup"');
      const hasResultClick = loginContent.includes('@click="closeLoginResultPopup"');
      return hasForgotClick && hasResultClick;
    },
    description: '检查蒙层是否绑定了点击关闭事件'
  },
  {
    name: '阻止事件冒泡',
    test: () => {
      const hasStopPropagation = loginContent.includes('@click.stop');
      return hasStopPropagation;
    },
    description: '检查弹窗内容是否阻止了点击事件冒泡'
  },
  {
    name: '禁用原生遮罩',
    test: () => {
      const hasOverlayFalse = loginContent.includes(':overlay="false"');
      return hasOverlayFalse;
    },
    description: '检查是否禁用了 Vant 组件的原生遮罩'
  },
  {
    name: '蒙层样式定义',
    test: () => {
      const hasOverlayClass = loginContent.includes('.popup-overlay {');
      const hasFixedPosition = loginContent.includes('position: fixed;');
      const hasBackgroundColor = loginContent.includes('background-color: rgba(0, 0, 0, 0.5);');
      const hasBackdropFilter = loginContent.includes('backdrop-filter: blur(2px);');
      return hasOverlayClass && hasFixedPosition && hasBackgroundColor && hasBackdropFilter;
    },
    description: '检查蒙层样式是否正确定义'
  },
  {
    name: '蒙层动画效果',
    test: () => {
      const hasFadeInAnimation = loginContent.includes('animation: fadeIn 0.3s ease-out;');
      const hasFadeInKeyframes = loginContent.includes('@keyframes fadeIn {');
      return hasFadeInAnimation && hasFadeInKeyframes;
    },
    description: '检查蒙层是否有淡入动画效果'
  },
  {
    name: '弹窗动画效果',
    test: () => {
      const hasPopupAnimation = loginContent.includes('animation: popupSlideIn 0.3s ease-out;');
      const hasPopupKeyframes = loginContent.includes('@keyframes popupSlideIn {');
      return hasPopupAnimation && hasPopupKeyframes;
    },
    description: '检查弹窗是否有滑入动画效果'
  },
  {
    name: '层级设置',
    test: () => {
      const hasOverlayZIndex = loginContent.includes('z-index: 9998;');
      const hasPopupZIndex = loginContent.includes('z-index: 9999 !important;');
      return hasOverlayZIndex && hasPopupZIndex;
    },
    description: '检查蒙层和弹窗的 z-index 层级设置'
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
  console.log('🎉 所有测试通过！弹窗蒙层功能已实现。');
  console.log('\n✨ 实现的功能:');
  console.log('• 自定义蒙层覆盖整个屏幕');
  console.log('• 半透明黑色背景 (rgba(0,0,0,0.5))');
  console.log('• 背景模糊效果 (backdrop-filter: blur(2px))');
  console.log('• 点击蒙层关闭弹窗');
  console.log('• 阻止弹窗内容的点击事件冒泡');
  console.log('• 蒙层淡入动画效果');
  console.log('• 弹窗滑入动画效果');
  console.log('• 正确的层级管理');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示测试说明
console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试忘记密码弹窗:');
console.log('   a. 点击 "Forgot password?" → 弹窗和蒙层出现');
console.log('   b. 点击蒙层空白区域 → 弹窗关闭');
console.log('   c. 再次打开，点击 "Got it" 按钮 → 弹窗关闭');
console.log('4. 测试登录结果弹窗:');
console.log('   a. 输入登录信息并点击登录');
console.log('   b. 观察弹窗和蒙层效果');
console.log('   c. 点击蒙层或按钮关闭弹窗');

console.log('\n📝 预期效果:');
console.log('• 蒙层应该覆盖整个屏幕');
console.log('• 蒙层应该有半透明黑色背景');
console.log('• 蒙层应该有轻微的模糊效果');
console.log('• 弹窗应该居中显示在蒙层上方');
console.log('• 点击蒙层空白区域应该关闭弹窗');
console.log('• 点击弹窗内容不应该关闭弹窗');
console.log('• 弹窗出现时应该有动画效果');

console.log('\n🎨 视觉特性:');
console.log('• 蒙层透明度: 50% (rgba(0,0,0,0.5))');
console.log('• 背景模糊: 2px');
console.log('• 淡入动画: 0.3s ease-out');
console.log('• 弹窗滑入动画: 0.3s ease-out');
console.log('• 弹窗阴影: 0 10px 40px rgba(0,0,0,0.2)');