/**
 * 测试注册按钮点击问题
 * 模拟用户操作并检查问题
 */

const puppeteer = require('puppeteer');

async function testRegisterButtonClick() {
  console.log('🔍 测试注册按钮点击问题...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 },
      devtools: true // 打开开发者工具
    });
    
    const page = await browser.newPage();
    
    // 监听控制台日志
    page.on('console', msg => {
      console.log('🖥️ 浏览器控制台:', msg.text());
    });
    
    // 监听页面错误
    page.on('pageerror', error => {
      console.log('❌ 页面错误:', error.message);
    });
    
    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('📡 API请求:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log('📨 API响应:', response.status(), response.url());
      }
    });
    
    // 1. 访问注册页面
    console.log('1️⃣ 访问注册页面...');
    await page.goto('http://localhost:8080/register', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 等待页面加载
    await page.waitForSelector('.register-form', { timeout: 10000 });
    console.log('✅ 注册页面加载完成');
    
    // 2. 填写表单
    console.log('\n2️⃣ 填写注册表单...');
    
    // 填写邮箱
    await page.type('input[name="email"]', 'test@example.com');
    console.log('✅ 邮箱已填写');
    
    // 获取验证码
    console.log('📧 点击发送验证码...');
    await page.click('.send-code-button');
    
    // 等待验证码响应
    await page.waitForTimeout(3000);
    
    // 检查是否有验证码返回（开发环境会在响应中返回）
    const verificationCode = await page.evaluate(() => {
      // 尝试从控制台或页面中获取验证码
      return window.lastVerificationCode || '123456';
    });
    
    // 填写验证码
    await page.type('input[name="verificationCode"]', verificationCode);
    console.log('✅ 验证码已填写');
    
    // 填写密码
    await page.type('input[name="password"]', 'testpassword123');
    console.log('✅ 密码已填写');
    
    // 填写确认密码
    await page.type('input[name="confirmPassword"]', 'testpassword123');
    console.log('✅ 确认密码已填写');
    
    // 勾选同意条款
    await page.click('.van-checkbox');
    console.log('✅ 同意条款已勾选');
    
    // 3. 检查按钮状态
    console.log('\n3️⃣ 检查按钮状态...');
    
    const buttonInfo = await page.evaluate(() => {
      const button = document.querySelector('.register-button');
      return {
        exists: !!button,
        disabled: button?.disabled || button?.classList.contains('van-button--disabled'),
        text: button?.textContent?.trim(),
        type: button?.type,
        nativeType: button?.getAttribute('native-type')
      };
    });
    
    console.log('📊 按钮信息:', buttonInfo);
    
    // 检查Vue组件状态
    const vueState = await page.evaluate(() => {
      const app = document.querySelector('#app').__vue__;
      const registerComponent = app.$children.find(child => 
        child.$options.name === 'Register' || 
        child.handleRegister
      );
      
      if (registerComponent) {
        return {
          canSubmit: registerComponent.canSubmit,
          isRegistering: registerComponent.isRegistering,
          formData: registerComponent.form,
          errors: registerComponent.errors
        };
      }
      return null;
    });
    
    console.log('📊 Vue组件状态:', vueState);
    
    // 4. 点击注册按钮
    console.log('\n4️⃣ 点击注册按钮...');
    
    if (buttonInfo.disabled) {
      console.log('❌ 按钮被禁用，无法点击');
      console.log('💡 可能原因:');
      console.log('   - canSubmit 返回 false');
      console.log('   - 表单验证失败');
      console.log('   - 必填字段未填写');
    } else {
      console.log('✅ 按钮可点击，尝试点击...');
      
      // 点击按钮
      await page.click('.register-button');
      
      // 等待可能的网络请求
      await page.waitForTimeout(5000);
      
      console.log('✅ 按钮已点击');
    }
    
    // 5. 检查结果
    console.log('\n5️⃣ 检查结果...');
    
    const currentUrl = page.url();
    console.log('📍 当前URL:', currentUrl);
    
    if (currentUrl.includes('/home')) {
      console.log('🎉 注册成功，已跳转到首页');
    } else if (currentUrl.includes('/register')) {
      console.log('⚠️ 仍在注册页面，可能注册失败或有错误');
    }
    
    // 保持浏览器打开以便手动检查
    console.log('\n🔍 浏览器将保持打开状态，请手动检查...');
    console.log('按 Ctrl+C 关闭测试');
    
    // 等待用户手动关闭
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 简化版测试（不需要puppeteer）
async function simpleButtonTest() {
  console.log('🔍 简化版按钮测试...');
  
  // 检查前端是否运行
  const axios = require('axios');
  
  try {
    const response = await axios.get('http://localhost:8080', { timeout: 5000 });
    console.log('✅ 前端服务正常运行');
    
    console.log('\n💡 手动测试步骤:');
    console.log('1. 打开浏览器访问: http://localhost:8080/register');
    console.log('2. 打开开发者工具 (F12)');
    console.log('3. 填写所有表单字段:');
    console.log('   - 邮箱: test@example.com');
    console.log('   - 点击发送验证码');
    console.log('   - 验证码: (从控制台获取或使用123456)');
    console.log('   - 密码: testpassword123');
    console.log('   - 确认密码: testpassword123');
    console.log('   - 勾选同意条款');
    console.log('4. 检查按钮是否可点击 (不是灰色)');
    console.log('5. 点击 Create Account 按钮');
    console.log('6. 查看控制台日志和网络面板');
    
    console.log('\n🔍 预期看到的日志:');
    console.log('   🚀 Register button clicked, starting registration process...');
    console.log('   ✅ Form validation passed, calling register API...');
    
    console.log('\n🔍 预期看到的网络请求:');
    console.log('   POST http://localhost:3000/api/auth/register');
    
  } catch (error) {
    console.log('❌ 前端服务未运行');
    console.log('💡 请先启动前端服务: npm run serve');
  }
}

// 运行测试
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--simple')) {
    simpleButtonTest();
  } else {
    console.log('🚀 开始注册按钮点击测试...');
    console.log('=====================================');
    console.log('💡 如果没有安装puppeteer，请运行: node test-register-button-click.js --simple');
    console.log('');
    
    testRegisterButtonClick().catch(error => {
      console.error('❌ 测试执行失败:', error);
      console.log('\n💡 尝试简化版测试: node test-register-button-click.js --simple');
      process.exit(1);
    });
  }
}

module.exports = { testRegisterButtonClick, simpleButtonTest };