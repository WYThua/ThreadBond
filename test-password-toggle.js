/**
 * 测试密码显示/隐藏功能
 * 验证注册和登录页面的眼睛图标功能
 */

const puppeteer = require('puppeteer');

async function testPasswordToggle() {
  console.log('🔍 开始测试密码显示/隐藏功能...');

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 }
    });
    
    const page = await browser.newPage();

    // 测试注册页面
    console.log('📝 测试注册页面密码切换功能...');
    await page.goto('http://localhost:8080/register');
    await page.waitForSelector('.register-form', { timeout: 10000 });

    // 输入密码
    await page.type('input[name="password"]', 'testpassword123');
    await page.type('input[name="confirmPassword"]', 'testpassword123');

    // 检查初始状态（密码应该被隐藏）
    const passwordType = await page.$eval('input[name="password"]', el => el.type);
    const confirmPasswordType = await page.$eval('input[name="confirmPassword"]', el => el.type);
    
    console.log('✅ 初始密码类型:', passwordType);
    console.log('✅ 初始确认密码类型:', confirmPasswordType);

    if (passwordType !== 'password' || confirmPasswordType !== 'password') {
      throw new Error('❌ 密码字段初始状态应该是隐藏的');
    }

    // 点击密码字段的眼睛图标
    await page.click('.password-field .password-toggle-icon');
    await page.waitForTimeout(500);

    // 检查密码是否变为可见
    const passwordTypeAfterToggle = await page.$eval('input[name="password"]', el => el.type);
    console.log('👁️ 点击眼睛图标后密码类型:', passwordTypeAfterToggle);

    if (passwordTypeAfterToggle !== 'text') {
      throw new Error('❌ 点击眼睛图标后密码应该变为可见');
    }

    // 再次点击隐藏密码
    await page.click('.password-field .password-toggle-icon');
    await page.waitForTimeout(500);

    const passwordTypeAfterSecondToggle = await page.$eval('input[name="password"]', el => el.type);
    console.log('🙈 再次点击后密码类型:', passwordTypeAfterSecondToggle);

    if (passwordTypeAfterSecondToggle !== 'password') {
      throw new Error('❌ 再次点击后密码应该被隐藏');
    }

    // 测试确认密码字段
    const confirmPasswordFields = await page.$$('.password-field');
    if (confirmPasswordFields.length >= 2) {
      await confirmPasswordFields[1].click('.password-toggle-icon');
      await page.waitForTimeout(500);

      const confirmPasswordTypeAfterToggle = await page.$eval('input[name="confirmPassword"]', el => el.type);
      console.log('👁️ 确认密码字段切换后类型:', confirmPasswordTypeAfterToggle);

      if (confirmPasswordTypeAfterToggle !== 'text') {
        throw new Error('❌ 确认密码字段切换功能异常');
      }
    }

    console.log('✅ 注册页面密码切换功能测试通过');

    // 测试登录页面
    console.log('🔐 测试登录页面密码切换功能...');
    await page.goto('http://localhost:8080/login');
    await page.waitForSelector('.login-form', { timeout: 10000 });

    // 输入密码
    await page.type('input[name="password"]', 'loginpassword123');

    // 检查初始状态
    const loginPasswordType = await page.$eval('input[name="password"]', el => el.type);
    console.log('✅ 登录页面初始密码类型:', loginPasswordType);

    if (loginPasswordType !== 'password') {
      throw new Error('❌ 登录页面密码字段初始状态应该是隐藏的');
    }

    // 点击眼睛图标
    await page.click('.password-field .password-toggle-icon');
    await page.waitForTimeout(500);

    const loginPasswordTypeAfterToggle = await page.$eval('input[name="password"]', el => el.type);
    console.log('👁️ 登录页面点击后密码类型:', loginPasswordTypeAfterToggle);

    if (loginPasswordTypeAfterToggle !== 'text') {
      throw new Error('❌ 登录页面密码切换功能异常');
    }

    console.log('✅ 登录页面密码切换功能测试通过');

    // 检查图标变化
    console.log('🎨 检查图标变化...');
    
    // 在显示状态下检查图标
    const visibleIcon = await page.$eval('.password-toggle-icon', el => el.getAttribute('name'));
    console.log('👁️ 密码可见时图标:', visibleIcon);

    // 切换回隐藏状态
    await page.click('.password-field .password-toggle-icon');
    await page.waitForTimeout(500);

    const hiddenIcon = await page.$eval('.password-toggle-icon', el => el.getAttribute('name'));
    console.log('🙈 密码隐藏时图标:', hiddenIcon);

    if (visibleIcon === hiddenIcon) {
      console.log('⚠️ 警告: 图标在显示和隐藏状态下相同，可能需要检查图标配置');
    }

    console.log('✅ 所有密码切换功能测试完成');

    // 测试样式和交互效果
    console.log('🎨 测试样式和交互效果...');
    
    // 检查hover效果（通过模拟鼠标悬停）
    await page.hover('.password-toggle-icon');
    await page.waitForTimeout(300);
    
    console.log('✅ 鼠标悬停效果测试完成');

    return {
      success: true,
      message: '密码显示/隐藏功能测试全部通过'
    };

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return {
      success: false,
      message: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 运行测试
if (require.main === module) {
  testPasswordToggle().then(result => {
    console.log('\n📊 测试结果:');
    console.log('状态:', result.success ? '✅ 成功' : '❌ 失败');
    console.log('信息:', result.message);
    
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ 测试执行错误:', error);
    process.exit(1);
  });
}

module.exports = { testPasswordToggle };