/**
 * 调试验证码发送问题
 * 检查邮件服务配置和验证码发送流程
 */

const axios = require('axios');

async function debugVerificationCode() {
  console.log('🔍 调试验证码发送问题...');
  
  const testEmail = '1508214787@qq.com';
  const backendUrl = 'http://localhost:3000';
  
  try {
    console.log(`📧 测试邮箱: ${testEmail}`);
    console.log(`🌐 后端地址: ${backendUrl}`);
    
    // 1. 检查后端服务是否运行
    console.log('\n1️⃣ 检查后端服务状态...');
    try {
      const healthResponse = await axios.get(`${backendUrl}/health`);
      console.log('✅ 后端服务正常运行');
      console.log('📊 健康检查响应:', healthResponse.data);
    } catch (error) {
      console.log('❌ 后端服务未运行或无法访问');
      console.log('💡 请先启动后端服务: node start-with-docker.js');
      return;
    }
    
    // 2. 发送验证码请求
    console.log('\n2️⃣ 发送验证码请求...');
    try {
      const response = await axios.post(`${backendUrl}/api/auth/send-verification-code`, {
        email: testEmail
      });
      
      console.log('✅ 验证码请求成功');
      console.log('📨 响应数据:', JSON.stringify(response.data, null, 2));
      
      // 检查是否返回了验证码（开发环境）
      if (response.data.data && response.data.data.code) {
        console.log(`🔢 生成的验证码: ${response.data.data.code}`);
      }
      
    } catch (error) {
      console.log('❌ 验证码请求失败');
      
      if (error.response) {
        console.log('📊 错误响应:', JSON.stringify(error.response.data, null, 2));
        console.log('🔢 状态码:', error.response.status);
        
        // 分析具体错误
        if (error.response.status === 429) {
          console.log('⏰ 错误原因: 请求过于频繁，需要等待');
        } else if (error.response.status === 400) {
          console.log('📝 错误原因: 请求参数有误');
        } else if (error.response.status === 500) {
          console.log('🔧 错误原因: 服务器内部错误');
        }
      } else if (error.request) {
        console.log('🌐 网络错误: 无法连接到后端服务');
      } else {
        console.log('❓ 未知错误:', error.message);
      }
    }
    
    // 3. 检查邮件服务配置
    console.log('\n3️⃣ 检查邮件服务配置...');
    
    // 读取环境配置
    const fs = require('fs');
    const path = require('path');
    
    try {
      const envPath = path.join(__dirname, 'backend/.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // 检查SMTP配置
      const smtpHost = envContent.match(/SMTP_HOST="?([^"\n]+)"?/)?.[1];
      const smtpUser = envContent.match(/SMTP_USER="?([^"\n]+)"?/)?.[1];
      const smtpPass = envContent.match(/SMTP_PASS="?([^"\n]+)"?/)?.[1];
      
      console.log('📧 SMTP配置:');
      console.log(`   主机: ${smtpHost || '未配置'}`);
      console.log(`   用户: ${smtpUser || '未配置'}`);
      console.log(`   密码: ${smtpPass ? '已配置' : '未配置'}`);
      
      if (!smtpHost || !smtpUser || !smtpPass) {
        console.log('⚠️ 邮件服务配置不完整');
        console.log('💡 这可能是验证码发送失败的原因');
      }
      
    } catch (error) {
      console.log('❌ 无法读取环境配置文件');
    }
    
    // 4. 提供解决方案
    console.log('\n4️⃣ 问题分析和解决方案:');
    
    console.log('\n🔍 可能的问题原因:');
    console.log('1. 邮件服务配置不正确或缺失');
    console.log('2. SMTP服务器连接失败');
    console.log('3. 邮箱地址被SMTP服务器拒绝');
    console.log('4. 网络连接问题');
    console.log('5. 验证码生成或存储失败');
    
    console.log('\n💡 解决方案:');
    console.log('1. 检查 backend/.env 文件中的SMTP配置');
    console.log('2. 确保SMTP服务器信息正确');
    console.log('3. 检查邮箱服务商的安全设置');
    console.log('4. 查看后端服务器日志');
    console.log('5. 尝试使用其他邮箱地址测试');
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message);
  }
}

// 检查后端日志的函数
async function checkBackendLogs() {
  console.log('\n📋 检查后端日志...');
  
  // 这里可以添加读取Docker日志的逻辑
  console.log('💡 请检查Docker容器日志:');
  console.log('   docker logs threadbond-backend');
  console.log('   或者查看控制台输出中的错误信息');
}

// 测试邮件服务连接
async function testEmailService() {
  console.log('\n📧 测试邮件服务连接...');
  
  // 这里可以添加直接测试SMTP连接的逻辑
  console.log('💡 建议手动测试SMTP连接:');
  console.log('1. 使用邮件客户端测试SMTP设置');
  console.log('2. 检查防火墙和网络设置');
  console.log('3. 确认邮箱服务商的SMTP设置');
}

// 运行调试
if (require.main === module) {
  debugVerificationCode()
    .then(() => {
      checkBackendLogs();
      testEmailService();
      console.log('\n✅ 调试完成');
    })
    .catch(error => {
      console.error('❌ 调试失败:', error);
      process.exit(1);
    });
}

module.exports = { debugVerificationCode };