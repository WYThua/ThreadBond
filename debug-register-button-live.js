/**
 * 实时调试注册按钮问题
 * 检查按钮为什么没有反应
 */

console.log('🔍 开始调试注册按钮...');

// 检查表单数据
function checkFormData() {
  console.log('📋 检查表单数据:');
  
  // 尝试获取Vue实例
  const app = document.querySelector('#app').__vue__;
  if (!app) {
    console.log('❌ 无法获取Vue实例');
    return;
  }
  
  // 查找注册组件
  let registerComponent = null;
  
  function findRegisterComponent(component) {
    if (component.$options.name === 'Register') {
      return component;
    }
    
    if (component.$children) {
      for (let child of component.$children) {
        const found = findRegisterComponent(child);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  registerComponent = findRegisterComponent(app);
  
  if (!registerComponent) {
    console.log('❌ 无法找到注册组件');
    return;
  }
  
  console.log('✅ 找到注册组件');
  
  // 检查表单数据
  const form = registerComponent.form;
  const errors = registerComponent.errors;
  const canSubmit = registerComponent.canSubmit;
  
  console.log('📊 表单数据:', form);
  console.log('📊 错误信息:', errors);
  console.log('📊 可以提交:', canSubmit);
  
  // 检查每个字段
  console.log('\n📋 字段检查:');
  console.log(`   邮箱: "${form.email}" ${form.email ? '✅' : '❌'}`);
  console.log(`   验证码: "${form.verificationCode}" ${form.verificationCode ? '✅' : '❌'}`);
  console.log(`   密码: "${form.password}" ${form.password ? '✅' : '❌'}`);
  console.log(`   确认密码: "${form.confirmPassword}" ${form.confirmPassword ? '✅' : '❌'}`);
  console.log(`   同意条款: ${form.agreeTerms} ${form.agreeTerms ? '✅' : '❌'}`);
  
  // 检查密码匹配
  const passwordMatch = form.password === form.confirmPassword;
  console.log(`   密码匹配: ${passwordMatch ? '✅' : '❌'}`);
  
  // 检查密码长度
  const passwordLength = form.password && form.password.length >= 6;
  console.log(`   密码长度: ${passwordLength ? '✅' : '❌'}`);
  
  // 检查错误
  const hasErrors = errors.email || errors.verificationCode || errors.password || errors.confirmPassword;
  console.log(`   无错误: ${!hasErrors ? '✅' : '❌'}`);
  
  if (hasErrors) {
    console.log('   错误详情:', errors);
  }
  
  // 手动计算canSubmit
  const manualCanSubmit = form.email && 
                         form.verificationCode &&
                         form.password && 
                         form.confirmPassword && 
                         form.agreeTerms &&
                         form.password === form.confirmPassword &&
                         form.password.length >= 6 &&
                         !errors.email &&
                         !errors.verificationCode &&
                         !errors.password &&
                         !errors.confirmPassword;
  
  console.log(`\n📊 手动计算canSubmit: ${manualCanSubmit ? '✅' : '❌'}`);
  console.log(`📊 组件canSubmit: ${canSubmit ? '✅' : '❌'}`);
  
  if (manualCanSubmit !== canSubmit) {
    console.log('⚠️ canSubmit计算不一致！');
  }
  
  return registerComponent;
}

// 检查按钮状态
function checkButtonState() {
  console.log('\n🔘 检查按钮状态:');
  
  const button = document.querySelector('.register-button');
  if (!button) {
    console.log('❌ 找不到注册按钮');
    return;
  }
  
  console.log('✅ 找到注册按钮');
  console.log(`   禁用状态: ${button.disabled ? '❌ 已禁用' : '✅ 可点击'}`);
  console.log(`   加载状态: ${button.classList.contains('van-button--loading') ? '⏳ 加载中' : '✅ 正常'}`);
  
  // 检查按钮事件
  const events = getEventListeners ? getEventListeners(button) : null;
  if (events) {
    console.log('   事件监听器:', Object.keys(events));
  }
}

// 手动触发注册
function manualTriggerRegister() {
  console.log('\n🚀 手动触发注册:');
  
  const registerComponent = checkFormData();
  if (!registerComponent) {
    console.log('❌ 无法获取注册组件');
    return;
  }
  
  if (!registerComponent.canSubmit) {
    console.log('❌ 表单验证未通过，无法提交');
    return;
  }
  
  console.log('✅ 表单验证通过，尝试手动触发注册...');
  
  try {
    registerComponent.handleRegister();
    console.log('✅ 手动触发成功');
  } catch (error) {
    console.log('❌ 手动触发失败:', error);
  }
}

// 添加按钮点击监听
function addButtonClickListener() {
  console.log('\n👂 添加按钮点击监听:');
  
  const button = document.querySelector('.register-button');
  if (!button) {
    console.log('❌ 找不到按钮');
    return;
  }
  
  button.addEventListener('click', function(event) {
    console.log('🖱️ 按钮被点击了!');
    console.log('   事件:', event);
    console.log('   按钮禁用:', this.disabled);
    console.log('   事件被阻止:', event.defaultPrevented);
  });
  
  console.log('✅ 已添加点击监听器');
}

// 运行所有检查
function runAllChecks() {
  console.log('🔍 运行所有检查...');
  console.log('=====================================');
  
  checkFormData();
  checkButtonState();
  addButtonClickListener();
  
  console.log('\n💡 调试建议:');
  console.log('1. 如果按钮被禁用，检查表单字段是否都已填写');
  console.log('2. 如果表单验证失败，检查具体的错误信息');
  console.log('3. 如果按钮可点击但没反应，可能是事件绑定问题');
  console.log('4. 可以在控制台运行 manualTriggerRegister() 手动触发');
  
  // 将函数暴露到全局
  window.manualTriggerRegister = manualTriggerRegister;
  window.checkFormData = checkFormData;
  window.checkButtonState = checkButtonState;
  
  console.log('\n🔧 可用的调试函数:');
  console.log('- manualTriggerRegister() - 手动触发注册');
  console.log('- checkFormData() - 检查表单数据');
  console.log('- checkButtonState() - 检查按钮状态');
}

// 等待页面加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllChecks);
} else {
  runAllChecks();
}