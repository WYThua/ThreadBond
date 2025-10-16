#!/usr/bin/env node

/**
 * 测试弹窗交互和蒙层透明度
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试弹窗交互和蒙层透明度...\n');

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
    name: '忘记密码弹窗关闭按钮',
    test: () => {
      const hasClickBinding = loginContent.includes('@click="showForgotPasswordPopup = false"');
      return hasClickBinding;
    },
    description: '检查忘记密码弹窗的关闭按钮是否正确绑定'
  },
  {
    name: '登录结果弹窗关闭按钮',
    test: () => {
      const hasClickBinding = loginContent.includes('@click="closeLoginResultPopup"');
      const hasMethod = loginContent.includes('closeLoginResultPopup() {');
      return hasClickBinding && hasMethod;
    },
    description: '检查登录结果弹窗的关闭按钮和方法'
  },
  {
    name: '弹窗关闭方法实现',
    test: () => {
      const hasCloseAction = loginContent.includes('this.showLoginResultPopup = false');
      const hasRedirectLogic = loginContent.includes('if (this.loginResult.success)');
      return hasCloseAction && hasRedirectLogic;
    },
    description: '检查弹窗关闭方法是否正确实现'
  },
  {
    name: '蒙层透明度优化',
    test: () => {
      const hasLighterOverlay = loginContent.includes('rgba(0, 0, 0, 0.4)');
      const hasReducedBlur = loginContent.includes('backdrop-filter: blur(1px)');
      return hasLighterOverlay && hasReducedBlur;
    },
    description: '检查蒙层是否使用更浅的透明度'
  },
  {
    name: '按钮样式优化',
    test: () => {
      const hasImportantStyles = loginContent.includes('background: #1989fa !important');
      const hasHoverEffect = loginContent.includes('&:hover {');
      const hasActiveEffect = loginContent.includes('&:active {');
      const hasFocusEffect = loginContent.includes('&:focus {');
      return hasImportantStyles && hasHoverEffect && hasActiveEffect && hasFocusEffect;
    },
    description: '检查按钮是否有优化的样式和交互效果'
  },
  {
    name: '按钮阴影效果',
    test: () => {
      const hasBoxShadow = loginContent.includes('box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3)');
      const hasHoverShadow = loginContent.includes('box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4)');
      return hasBoxShadow && hasHoverShadow;
    },
    description: '检查按钮是否有阴影效果增强视觉反馈'
  },
  {
    name: '调试日志',
    test: () => {
      const hasCloseLog = loginContent.includes('console.log(\'🔘 Closing login result popup...\')');
      const hasRedirectLog = loginContent.includes('console.log(\'✅ Login was successful, redirecting...\')');
      return hasCloseLog && hasRedirectLog;
    },
    description: '检查是否添加了调试日志帮助排查问题'
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
  console.log('🎉 所有测试通过！弹窗交互和蒙层透明度已优化。');
  console.log('\n✨ 修复的问题:');
  console.log('• 确保弹窗按钮点击能正确关闭弹窗');
  console.log('• 调整蒙层透明度从 0.7 到 0.4，减少黑暗感');
  console.log('• 减少背景模糊效果从 2px 到 1px');
  console.log('• 优化按钮样式和交互反馈');
  console.log('• 添加按钮阴影效果增强视觉层次');
  console.log('• 添加调试日志帮助排查问题');
} else {
  console.log('⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}

// 显示测试说明
console.log('\n🧪 手动测试步骤:');
console.log('1. 启动应用: node start-with-docker.js');
console.log('2. 访问登录页面: http://localhost:8080/login');
console.log('3. 测试弹窗交互:');
console.log('   a. 点击 "Forgot password?" → 弹窗应该出现');
console.log('   b. 点击 "Got it" 按钮 → 弹窗应该关闭');
console.log('   c. 输入登录信息并点击登录 → 结果弹窗出现');
console.log('   d. 点击 "OK" 按钮 → 弹窗应该关闭');
console.log('   e. 观察蒙层是否比之前更浅');

console.log('\n📝 预期效果:');
console.log('• 点击弹窗按钮应该立即关闭弹窗');
console.log('• 蒙层应该是浅灰色而不是深黑色');
console.log('• 按钮应该有悬停和点击效果');
console.log('• 按钮应该有阴影增强立体感');
console.log('• 控制台应该显示调试信息');

console.log('\n🔧 如果按钮仍然无法关闭弹窗:');
console.log('1. 检查浏览器控制台是否有 JavaScript 错误');
console.log('2. 确认是否看到调试日志输出');
console.log('3. 尝试刷新页面重新测试');
console.log('4. 检查是否有其他 CSS 样式冲突');