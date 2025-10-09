// 测试错误修复
const puppeteer = require('puppeteer');

async function testErrorFixes() {
  console.log('开始测试错误修复...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 监听控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ 控制台错误:', msg.text());
    } else if (msg.type() === 'warn') {
      console.log('⚠️  控制台警告:', msg.text());
    }
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ 页面错误:', error.message);
  });
  
  try {
    // 访问应用首页
    console.log('访问应用首页...');
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 检查是否有 Vuex mutation 错误
    const vuexErrors = errors.filter(error => 
      error.includes('unknown mutation type: app/setCurrentRoute')
    );
    
    if (vuexErrors.length === 0) {
      console.log('✅ Vuex mutation 错误已修复');
    } else {
      console.log('❌ Vuex mutation 错误仍然存在:', vuexErrors);
    }
    
    // 检查是否有 getBoundingClientRect 错误
    const domErrors = errors.filter(error => 
      error.includes('getBoundingClientRect') || 
      error.includes('Cannot read properties of undefined')
    );
    
    if (domErrors.length === 0) {
      console.log('✅ DOM 操作错误已修复或被正确处理');
    } else {
      console.log('❌ DOM 操作错误仍然存在:', domErrors);
    }
    
    // 尝试导航到不同页面
    console.log('测试页面导航...');
    
    // 等待欢迎页面加载
    await page.waitForSelector('.welcome-container', { timeout: 10000 });
    console.log('✅ 欢迎页面加载成功');
    
    // 点击登录按钮
    const loginButton = await page.$('.login-btn');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 导航到登录页面成功');
    }
    
    // 返回首页
    await page.goto('http://localhost:8080/welcome');
    await page.waitForTimeout(2000);
    
    console.log('\n=== 测试结果 ===');
    console.log(`总错误数: ${errors.length}`);
    
    if (errors.length === 0) {
      console.log('🎉 所有错误都已修复！');
    } else {
      console.log('⚠️  仍有以下错误需要处理:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

// 运行测试
testErrorFixes().catch(console.error);