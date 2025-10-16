/**
 * 查看已注册的用户账号
 * 通过 Docker 连接到 MySQL 数据库查询用户信息
 */

const axios = require('axios');

async function checkRegisteredUsers() {
  console.log('🔍 查看已注册的用户账号...\n');

  try {
    // 方法1: 通过 Docker 执行 MySQL 查询
    console.log('📊 方法1: 通过 Docker 查询数据库');
    const { exec } = require('child_process');
    
    const mysqlQuery = `
      docker exec threadbond-mysql mysql -u root -pthreadbond_password -D threadbond -e "
        SELECT 
          id,
          email,
          createdAt,
          isActive,
          lastActiveAt
        FROM User 
        ORDER BY createdAt DESC 
        LIMIT 10;
      "
    `;

    exec(mysqlQuery, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 数据库查询失败:', error.message);
        console.log('💡 提示: 确保 Docker 容器正在运行');
        return;
      }

      if (stderr) {
        console.error('⚠️ 查询警告:', stderr);
      }

      if (stdout) {
        console.log('✅ 数据库查询结果:');
        console.log(stdout);
      }
    });

    // 方法2: 检查是否有用户管理 API
    console.log('\n📊 方法2: 尝试通过 API 查询');
    try {
      // 注意: 这需要管理员权限，实际应用中不应该暴露所有用户信息
      const response = await axios.get('http://localhost:3000/api/users/list');
      console.log('✅ API 查询结果:', response.data);
    } catch (error) {
      console.log('ℹ️ 用户列表 API 不存在（这是正常的安全设计）');
    }

  } catch (error) {
    console.error('❌ 查询过程中发生错误:', error.message);
  }
}

// 查看验证码发送情况
async function checkVerificationCodeStatus() {
  console.log('\n📧 关于验证码发送的说明...\n');

  console.log('🔧 当前验证码系统状态:');
  console.log('=====================================');
  console.log('📍 存储方式: 内存存储（开发环境）');
  console.log('⏰ 有效期: 5分钟');
  console.log('🔄 发送间隔: 60秒');
  console.log('📧 邮件服务: 未配置（开发环境）');
  console.log('🖥️ 验证码显示: 后端控制台');
  console.log('');

  console.log('💡 关于真实邮箱验证码发送:');
  console.log('=====================================');
  console.log('❌ 当前系统未配置真实的邮件发送服务');
  console.log('🔧 需要配置 SMTP 服务器才能发送真实邮件');
  console.log('📝 在开发环境下，验证码会显示在后端控制台');
  console.log('🎯 生产环境需要集成邮件服务提供商');
  console.log('');

  console.log('🛠️ 如需配置真实邮件发送:');
  console.log('=====================================');
  console.log('1. 配置 SMTP 服务器（如 Gmail, SendGrid, 阿里云邮件等）');
  console.log('2. 更新 emailService.ts 文件');
  console.log('3. 添加环境变量配置');
  console.log('4. 在发送验证码 API 中调用邮件服务');
  console.log('');

  // 测试当前验证码生成
  console.log('🧪 测试验证码生成功能:');
  try {
    const testEmail = 'test@example.com';
    const response = await axios.post('http://localhost:3000/api/auth/send-verification-code', {
      email: testEmail
    });

    if (response.data.success) {
      console.log('✅ 验证码生成成功');
      console.log('📧 测试邮箱:', testEmail);
      console.log('🔢 生成的验证码:', response.data.data.code);
      console.log('⏰ 过期时间:', response.data.data.expiresIn, '秒');
      console.log('');
      console.log('💡 在开发环境下，这个验证码会显示在后端 Docker 容器的日志中');
      console.log('📋 查看后端日志命令: docker logs threadbond-backend');
    }
  } catch (error) {
    if (error.response) {
      console.log('⚠️ 验证码请求:', error.response.data.message);
    } else {
      console.log('❌ 验证码测试失败:', error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('👥 ThreadBond 用户管理查询');
  console.log('=====================================\n');

  await checkRegisteredUsers();
  await checkVerificationCodeStatus();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkRegisteredUsers, checkVerificationCodeStatus };