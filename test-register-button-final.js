/**
 * 最终测试注册按钮修复
 */

console.log('🔍 注册按钮最终测试');
console.log('=====================================');

// 检查页面是否加载
function checkPageLoaded() {
  if (document.querySelector('.register-form')) {
    console.log('✅ 注册页面已加载');
    return true;
  } else {
    console.log('❌ 注册页面未加载');
    return false;
  }
}

// 检查Vue组件
function checkVueComponent() {
  try {
    const app = document.querySelector('#app').__vue__;
    if (app) {
      console.log('✅ Vue应用已加载');
      
      // 查找注册组件
      function findComponent(component, name) {
        if (component.$options.name === name) {
          return component;
        }
        if (component.$children) {
          for (let child of component.$children) {
            const found = findComponent(child, name);
            if (found) return found;
          }
        }
        return null;
      }
      
      const registerComponent = findComponent(app, 'Register');
      if (registerComponent) {
        console.log('✅ 注册组件已找到');
        return registerComponent;
      } else {
        console.log('❌ 注册组件未找到');
        return null;
      }
    }
  } catch (error) {
    console.log('❌ Vue组件检查失败:', error);
    return null;
  }
}

// 模拟填写表单
function fillForm(component) {
  console.log('📝 模拟填写表单...');
  
  // 填写表单数据
  component.form.email = 'test@example.com';
  component.form.verificationCode = '123456';
  component.form.password = 'password123';
  component.form.confirmPassword = 'password123';
  component.form.agreeTerms = true;
  
  // 清除错误
  component.errors = {
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
  };
  
  console.log('✅ 表单数据已填写');
  console.log('📊 表单数据:', component.form);
  console.log('📊 canSubmit:', component.canSubmit);
}

// 测试按钮点击
function testButtonClick(component) {
  console.log('🖱️ 测试按钮点击...');
  
  if (!component.canSubmit) {
    console.log('❌ 按钮被禁用，无法点击');
    return false;
  }
  
  try {
    // 直接调用handleRegister方法
    component.handleRegister();
    console.log('✅ handleRegister方法调用成功');
    return true;
  } catch (error) {
    console.log('❌ handleRegister方法调用失败:', error);
    return false;
  }
}

// 运行完整测试
function runCompleteTest() {
  console.log('🚀 开始完整测试...');
  
  if (!checkPageLoaded()) {
    console.log('💡 请确保在注册页面运行此测试');
    return;
  }
  
  const component = checkVueComponent();
  if (!component) {
    console.log('💡 Vue组件未正确加载');
    return;
  }
  
  fillForm(component);
  
  const success = testButtonClick(component);
  
  if (success) {
    console.log('\n🎉 测试成功！');
    console.log('💡 现在尝试在页面上点击注册按钮');
  } else {
    console.log('\n❌ 测试失败');
    console.log('💡 检查控制台错误信息');
  }
}

// 添加全局调试函数
window.testRegisterButton = runCompleteTest;
window.fillTestForm = function() {
  const component = checkVueComponent();
  if (component) {
    fillForm(component);
  }
};

// 自动运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runCompleteTest, 1000);
  });
} else {
  setTimeout(runCompleteTest, 1000);
}

console.log('\n🔧 可用的调试函数:');
console.log('- testRegisterButton() - 运行完整测试');
console.log('- fillTestForm() - 填写测试表单');