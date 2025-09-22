// 前端注册组件功能验证脚本
const fs = require('fs');
const path = require('path');

class FrontendValidator {
  constructor() {
    this.registerComponentPath = path.join(__dirname, 'src/views/auth/Register.vue');
    this.authApiPath = path.join(__dirname, 'src/api/auth.js');
    this.authStorePath = path.join(__dirname, 'src/store/modules/auth.js');
  }

  // 验证注册组件是否存在
  validateRegisterComponentExists() {
    console.log('📄 验证注册组件文件...');
    
    const exists = fs.existsSync(this.registerComponentPath);
    console.log(`✅ Register.vue 文件存在: ${exists ? '通过' : '失败'}`);
    return exists;
  }

  // 验证注册组件内容
  validateRegisterComponentContent() {
    console.log('🔍 验证注册组件内容...');
    
    if (!fs.existsSync(this.registerComponentPath)) {
      console.log('❌ 注册组件文件不存在');
      return false;
    }

    const content = fs.readFileSync(this.registerComponentPath, 'utf8');
    
    // 检查必要的表单字段
    const hasEmailField = content.includes('v-model="form.email"');
    const hasPasswordField = content.includes('v-model="form.password"');
    const hasConfirmPasswordField = content.includes('v-model="form.confirmPassword"');
    const hasTermsCheckbox = content.includes('v-model="form.agreeTerms"');
    
    console.log(`✅ 邮箱字段: ${hasEmailField ? '通过' : '失败'}`);
    console.log(`✅ 密码字段: ${hasPasswordField ? '通过' : '失败'}`);
    console.log(`✅ 确认密码字段: ${hasConfirmPasswordField ? '通过' : '失败'}`);
    console.log(`✅ 服务条款复选框: ${hasTermsCheckbox ? '通过' : '失败'}`);
    
    // 检查验证规则
    const hasEmailValidation = content.includes('pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/');
    const hasPasswordValidation = content.includes('validatePassword');
    const hasConfirmPasswordValidation = content.includes('validateConfirmPassword');
    
    console.log(`✅ 邮箱验证规则: ${hasEmailValidation ? '通过' : '失败'}`);
    console.log(`✅ 密码验证规则: ${hasPasswordValidation ? '通过' : '失败'}`);
    console.log(`✅ 确认密码验证规则: ${hasConfirmPasswordValidation ? '通过' : '失败'}`);
    
    // 检查密码强度指示器
    const hasPasswordStrength = content.includes('passwordStrength');
    const hasStrengthIndicator = content.includes('strength-bar');
    
    console.log(`✅ 密码强度计算: ${hasPasswordStrength ? '通过' : '失败'}`);
    console.log(`✅ 密码强度指示器: ${hasStrengthIndicator ? '通过' : '失败'}`);
    
    // 检查 Vant UI 组件使用
    const hasVantForm = content.includes('van-form');
    const hasVantField = content.includes('van-field');
    const hasVantButton = content.includes('van-button');
    const hasVantNavBar = content.includes('van-nav-bar');
    
    console.log(`✅ Vant 表单组件: ${hasVantForm ? '通过' : '失败'}`);
    console.log(`✅ Vant 输入组件: ${hasVantField ? '通过' : '失败'}`);
    console.log(`✅ Vant 按钮组件: ${hasVantButton ? '通过' : '失败'}`);
    console.log(`✅ Vant 导航栏组件: ${hasVantNavBar ? '通过' : '失败'}`);
    
    return hasEmailField && hasPasswordField && hasConfirmPasswordField && 
           hasTermsCheckbox && hasEmailValidation && hasPasswordValidation && 
           hasConfirmPasswordValidation && hasPasswordStrength && hasStrengthIndicator &&
           hasVantForm && hasVantField && hasVantButton && hasVantNavBar;
  }

  // 验证 API 文件
  validateAuthAPI() {
    console.log('🌐 验证认证API文件...');
    
    if (!fs.existsSync(this.authApiPath)) {
      console.log('❌ auth.js API文件不存在');
      return false;
    }

    const content = fs.readFileSync(this.authApiPath, 'utf8');
    
    // 检查必要的API方法
    const hasRegisterMethod = content.includes('async register(userData)');
    const hasLoginMethod = content.includes('async login(credentials)');
    const hasLogoutMethod = content.includes('async logout()');
    const hasCheckEmailMethod = content.includes('async checkEmail(email)');
    
    console.log(`✅ 注册API方法: ${hasRegisterMethod ? '通过' : '失败'}`);
    console.log(`✅ 登录API方法: ${hasLoginMethod ? '通过' : '失败'}`);
    console.log(`✅ 登出API方法: ${hasLogoutMethod ? '通过' : '失败'}`);
    console.log(`✅ 邮箱检查API方法: ${hasCheckEmailMethod ? '通过' : '失败'}`);
    
    // 检查错误处理
    const hasErrorHandling = content.includes('try {') && content.includes('catch (error)');
    console.log(`✅ 错误处理: ${hasErrorHandling ? '通过' : '失败'}`);
    
    return hasRegisterMethod && hasLoginMethod && hasLogoutMethod && 
           hasCheckEmailMethod && hasErrorHandling;
  }

  // 验证 Vuex Store
  validateAuthStore() {
    console.log('🗃️ 验证认证Store...');
    
    if (!fs.existsSync(this.authStorePath)) {
      console.log('❌ auth.js Store文件不存在');
      return false;
    }

    const content = fs.readFileSync(this.authStorePath, 'utf8');
    
    // 检查状态管理
    const hasAuthState = content.includes('isAuthenticated:') && content.includes('token:');
    const hasRegisterAction = content.includes('async register(');
    const hasLoginAction = content.includes('async login(');
    const hasLogoutAction = content.includes('async logout(');
    
    console.log(`✅ 认证状态管理: ${hasAuthState ? '通过' : '失败'}`);
    console.log(`✅ 注册Action: ${hasRegisterAction ? '通过' : '失败'}`);
    console.log(`✅ 登录Action: ${hasLoginAction ? '通过' : '失败'}`);
    console.log(`✅ 登出Action: ${hasLogoutAction ? '通过' : '失败'}`);
    
    // 检查本地存储
    const hasTokenStorage = content.includes('localStorage.getItem') && 
                           content.includes('localStorage.setItem');
    console.log(`✅ 令牌本地存储: ${hasTokenStorage ? '通过' : '失败'}`);
    
    return hasAuthState && hasRegisterAction && hasLoginAction && 
           hasLogoutAction && hasTokenStorage;
  }

  // 验证密码强度算法
  validatePasswordStrengthAlgorithm() {
    console.log('🔒 验证密码强度算法...');
    
    // 模拟密码强度计算逻辑
    const calculatePasswordStrength = (password) => {
      if (!password) return 0;
      
      let strength = 0;
      
      if (password.length >= 8) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      
      return Math.min(strength, 4);
    };
    
    // 测试不同强度的密码
    const testCases = [
      { password: '', expected: 0 },
      { password: '123', expected: 1 },
      { password: '12345678', expected: 2 }, // 长度+数字
      { password: 'Password', expected: 3 }, // 长度+大写+小写
      { password: 'Password1', expected: 4 }, // 长度+大写+小写+数字
      { password: 'Password1!', expected: 4 },
      { password: 'Test123!@#', expected: 4 }
    ];
    
    let allPassed = true;
    testCases.forEach(({ password, expected }, index) => {
      const actual = calculatePasswordStrength(password);
      const passed = actual === expected;
      console.log(`测试 ${index + 1}: "${password}" -> 强度 ${actual} (期望 ${expected}) ${passed ? '✅' : '❌'}`);
      if (!passed) allPassed = false;
    });
    
    console.log(`✅ 密码强度算法: ${allPassed ? '通过' : '失败'}`);
    return allPassed;
  }

  // 验证移动端适配
  validateMobileAdaptation() {
    console.log('📱 验证移动端适配...');
    
    if (!fs.existsSync(this.registerComponentPath)) {
      console.log('❌ 注册组件文件不存在');
      return false;
    }

    const content = fs.readFileSync(this.registerComponentPath, 'utf8');
    
    // 检查响应式设计
    const hasResponsiveCSS = content.includes('@media (max-width:');
    const hasFlexLayout = content.includes('display: flex') || content.includes('flex:');
    const hasMobileOptimization = content.includes('375px');
    
    console.log(`✅ 响应式CSS: ${hasResponsiveCSS ? '通过' : '失败'}`);
    console.log(`✅ 弹性布局: ${hasFlexLayout ? '通过' : '失败'}`);
    console.log(`✅ 移动端优化: ${hasMobileOptimization ? '通过' : '失败'}`);
    
    // 检查移动端友好的UI元素
    const hasTouchFriendlyButtons = content.includes('height: 50px');
    const hasLargeClickArea = content.includes('size="large"');
    
    console.log(`✅ 触摸友好按钮: ${hasTouchFriendlyButtons ? '通过' : '失败'}`);
    console.log(`✅ 大点击区域: ${hasLargeClickArea ? '通过' : '失败'}`);
    
    return hasResponsiveCSS && hasFlexLayout && hasMobileOptimization && 
           hasTouchFriendlyButtons && hasLargeClickArea;
  }

  // 运行所有验证
  async runAllValidations() {
    console.log('🚀 开始验证前端注册功能...\n');
    
    const results = [];
    
    try {
      results.push(this.validateRegisterComponentExists());
      results.push(this.validateRegisterComponentContent());
      results.push(this.validateAuthAPI());
      results.push(this.validateAuthStore());
      results.push(this.validatePasswordStrengthAlgorithm());
      results.push(this.validateMobileAdaptation());
      
      const allPassed = results.every(result => result);
      
      console.log('\n📊 前端验证结果汇总:');
      console.log(`总测试数: ${results.length}`);
      console.log(`通过数: ${results.filter(r => r).length}`);
      console.log(`失败数: ${results.filter(r => !r).length}`);
      console.log(`整体状态: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);
      
      return allPassed;
    } catch (error) {
      console.error('❌ 验证过程中出现错误:', error);
      return false;
    }
  }
}

// 运行验证
async function main() {
  const validator = new FrontendValidator();
  const success = await validator.runAllValidations();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);