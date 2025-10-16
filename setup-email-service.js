/**
 * 配置邮件服务
 * 帮助用户设置SMTP邮件服务
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmailService() {
  console.log('📧 邮件服务配置向导');
  console.log('=====================================');
  
  console.log('\n🔍 当前问题: 验证码邮件发送失败');
  console.log('📧 测试邮箱: 1508214787@qq.com');
  
  console.log('\n💡 常见邮件服务商SMTP设置:');
  console.log('1. QQ邮箱:');
  console.log('   SMTP服务器: smtp.qq.com');
  console.log('   端口: 587 (TLS) 或 465 (SSL)');
  console.log('   需要开启SMTP服务并获取授权码');
  
  console.log('\n2. 163邮箱:');
  console.log('   SMTP服务器: smtp.163.com');
  console.log('   端口: 587 或 465');
  
  console.log('\n3. Gmail:');
  console.log('   SMTP服务器: smtp.gmail.com');
  console.log('   端口: 587');
  console.log('   需要应用专用密码');
  
  const choice = await question('\n请选择配置方式:\n1. 使用QQ邮箱\n2. 使用163邮箱\n3. 使用Gmail\n4. 自定义配置\n5. 跳过邮件配置(仅开发环境)\n请输入选项 (1-5): ');
  
  let smtpConfig = {};
  
  switch (choice) {
    case '1':
      smtpConfig = await setupQQEmail();
      break;
    case '2':
      smtpConfig = await setup163Email();
      break;
    case '3':
      smtpConfig = await setupGmail();
      break;
    case '4':
      smtpConfig = await setupCustomEmail();
      break;
    case '5':
      smtpConfig = await setupDevelopmentMode();
      break;
    default:
      console.log('❌ 无效选项');
      rl.close();
      return;
  }
  
  // 更新.env文件
  await updateEnvFile(smtpConfig);
  
  console.log('\n✅ 邮件服务配置完成!');
  console.log('🔄 请重启后端服务以应用新配置');
  console.log('🧪 建议运行测试: node debug-verification-code.js');
  
  rl.close();
}

async function setupQQEmail() {
  console.log('\n📧 配置QQ邮箱SMTP服务');
  console.log('⚠️ 注意: 需要先在QQ邮箱中开启SMTP服务并获取授权码');
  
  const email = await question('请输入QQ邮箱地址: ');
  const password = await question('请输入QQ邮箱授权码 (不是登录密码): ');
  
  return {
    SMTP_HOST: 'smtp.qq.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: email,
    SMTP_PASS: password,
    FROM_EMAIL: email
  };
}

async function setup163Email() {
  console.log('\n📧 配置163邮箱SMTP服务');
  
  const email = await question('请输入163邮箱地址: ');
  const password = await question('请输入163邮箱授权码: ');
  
  return {
    SMTP_HOST: 'smtp.163.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: email,
    SMTP_PASS: password,
    FROM_EMAIL: email
  };
}

async function setupGmail() {
  console.log('\n📧 配置Gmail SMTP服务');
  console.log('⚠️ 注意: 需要使用应用专用密码，不是普通登录密码');
  
  const email = await question('请输入Gmail地址: ');
  const password = await question('请输入Gmail应用专用密码: ');
  
  return {
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: email,
    SMTP_PASS: password,
    FROM_EMAIL: email
  };
}

async function setupCustomEmail() {
  console.log('\n📧 自定义邮件服务配置');
  
  const host = await question('SMTP服务器地址: ');
  const port = await question('SMTP端口 (通常是587或465): ');
  const secure = await question('使用SSL? (y/n): ');
  const user = await question('邮箱用户名: ');
  const pass = await question('邮箱密码/授权码: ');
  const from = await question('发件人邮箱 (可选，默认使用用户名): ');
  
  return {
    SMTP_HOST: host,
    SMTP_PORT: port,
    SMTP_SECURE: secure.toLowerCase() === 'y' ? 'true' : 'false',
    SMTP_USER: user,
    SMTP_PASS: pass,
    FROM_EMAIL: from || user
  };
}

async function setupDevelopmentMode() {
  console.log('\n🔧 开发环境模式');
  console.log('⚠️ 邮件将不会实际发送，但验证码会在控制台显示');
  
  return {
    SMTP_HOST: 'localhost',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'dev@localhost',
    SMTP_PASS: 'dev-password',
    FROM_EMAIL: 'noreply@threadbond.com'
  };
}

async function updateEnvFile(config) {
  const envPath = path.join(__dirname, 'backend/.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 更新或添加SMTP配置
    Object.entries(config).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}="${value}"`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });
    
    // 备份原文件
    fs.writeFileSync(envPath + '.backup', fs.readFileSync(envPath));
    
    // 写入新配置
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env文件已更新');
    console.log('💾 原文件已备份为 .env.backup');
    
  } catch (error) {
    console.error('❌ 更新.env文件失败:', error.message);
  }
}

// 检查当前配置
function checkCurrentConfig() {
  console.log('\n🔍 检查当前邮件配置...');
  
  const envPath = path.join(__dirname, 'backend/.env');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const smtpHost = envContent.match(/SMTP_HOST="?([^"\n]+)"?/)?.[1];
    const smtpUser = envContent.match(/SMTP_USER="?([^"\n]+)"?/)?.[1];
    const smtpPass = envContent.match(/SMTP_PASS="?([^"\n]+)"?/)?.[1];
    
    console.log('📧 当前SMTP配置:');
    console.log(`   主机: ${smtpHost || '未配置'}`);
    console.log(`   用户: ${smtpUser || '未配置'}`);
    console.log(`   密码: ${smtpPass ? '已配置' : '未配置'}`);
    
    if (!smtpHost || smtpHost === 'your-email@gmail.com' || !smtpUser || !smtpPass) {
      console.log('⚠️ 邮件服务配置不完整，这可能是验证码发送失败的原因');
      return false;
    }
    
    console.log('✅ 邮件服务配置看起来正常');
    return true;
    
  } catch (error) {
    console.log('❌ 无法读取配置文件');
    return false;
  }
}

if (require.main === module) {
  console.log('🔍 检查验证码发送问题...');
  
  if (checkCurrentConfig()) {
    question('\n配置看起来正常，是否要重新配置? (y/n): ').then(answer => {
      if (answer.toLowerCase() === 'y') {
        setupEmailService();
      } else {
        console.log('💡 建议运行调试脚本: node debug-verification-code.js');
        rl.close();
      }
    });
  } else {
    setupEmailService();
  }
}

module.exports = { setupEmailService, checkCurrentConfig };