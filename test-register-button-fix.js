/**
 * 测试注册按钮修复
 */

const puppeteer = require('puppeteer');

async function testRegisterButtonFix() {
  console.log('🔍 测试注册按钮修复...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 }
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
    
    // 访问注册页面
    console.log('📱 访问注册页面...');
    await page.goto('http://localhost:8080/register');
    await page.waitForSelector('.register-form', { timeout: 10000 });
    
    console.log('✅ 注册页面加载成功');
    
    // 填写表单
    console.log('📝 填写注册表单...');
    
    // 填写邮箱
    await page.type('input[name="email"]', 'test@example.com');
    console.log('✅ 邮箱已填写');
    
    // 获取验证码
    console.log('📧 获取验证码...');
    await page.click('.send-code-button');
    await page.waitForTimeout(2000); // 等待验证码发送
    
    // 填写验证码（假设是123456）
    await page.type('input[name="verificationCode"]', '123456');
    console.log('✅ 验证码已填写');
    
    // 填写密码
    await page.type('input[name="password"]', 'password123');
    console.log('✅ 密码已填写');
    
    // 填写确认密码
    await page.type('input[name="confirmPassword"]', 'password123');
    console.log('✅ 确认密码已填写');
    
    // 勾选同意条款
    await page.click('.van-checkbox');
    console.log('✅ 同意条款已勾选');
    
    // 等待一下让Vue更新
    await page.waitForTimeout(1000);
    
    // 检查按钮状态
    const buttonDisabled = await page.$eval('.register-button', btn => btn.disabled);
    console.log(`🔘 按钮状态: ${buttonDisabled ? '❌ 禁用' : '✅ 可点击'}`);
    
    if (buttonDisabled) {
      console.log('❌ 按钮仍然被禁用，检查表单验证逻辑');
      
      // 执行调试脚本
      await page.evaluate(() => {
        // 检查Vue组件状态
        const app = document.querySelector('#app').__vue__;
        if (app && app.$children && app.$children[0]) {
          const component = app.$children[0];
          console.log('表单数据:', component.form);
          console.log('错误信息:', component.errors);
          console.log('canSubmit:', component.canSubmit);
        }
      });
      
      return false;
    }
    
    // 点击注册按钮
    console.log('🖱️ 点击注册按钮...');
    await page.click('.register-button');
    
    // 等待响应
    await page.waitForTimeout(3000);
    
    // 检查是否有网络请求
    console.log('🌐 检查网络请求...');
    
    // 检查是否跳转到首页
    const currentUrl = page.url();
    console.log('📍 当前URL:', currentUrl);
    
    if (currentUrl.includes('/home')) {
      console.log('🎉 注册成功，已跳转到首页');
      return true;
    } else {
      console.log('⚠️ 未跳转到首页，可能注册失败');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 简单的手动测试指南
function printManualTestGuide() {
  console.log('\n📋 手动测试指南:');
  console.log('=====================================');
  console.log('1. 打开浏览器访问: http://localhost:8080/register');
  console.log('2. 填写邮箱: test@example.com');
  console.log('3. 点击"Send Code"按钮获取验证码');
  console.log('4. 填写收到的验证码');
  console.log('5. 填写密码: password123');
  console.log('6. 填写确认密码: password123');
  console.log('7. 勾选同意条款');
  console.log('8. 点击"Create Account"按钮');
  console.log('');
  console.log('🔍 调试步骤:');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. 查看Console面板是否有错误');
  console.log('3. 查看Network面板是否有API请求');
  console.log('4. 在Console中运行以下代码检查状态:');
  console.log('   $vm0.form');
  console.log('   $vm0.canSubmit');
  console.log('   $vm0.errors');
}

if (require.main === module) {
  console.log('🚀 开始测试注册按钮修复...');
  
  // 检查是否有puppeteer
  try {
    require('puppeteer');
    testRegisterButtonFix().then(success => {
      if (success) {
        console.log('\n✅ 注册按钮测试成功');
      } else {
        console.log('\n❌ 注册按钮测试失败');
        printManualTestGuide();
      }
    });
  } catch (error) {
    console.log('⚠️ 未安装puppeteer，显示手动测试指南');
    printManualTestGuide();
  }
}

module.exports = { testRegisterButtonFix };