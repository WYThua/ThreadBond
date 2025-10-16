/**
 * 查看已注册用户 - 仅使用 Docker
 * 所有后端操作都在 Docker 容器中执行
 */

const { exec } = require('child_process');
const axios = require('axios');

class DockerUserChecker {
  constructor() {
    this.mysqlContainer = 'threadbond-mysql';
    this.backendContainer = 'threadbond-backend';
    this.dbUser = 'threadbond_user';
    this.dbPassword = 'threadbond_pass_2024';
    this.dbName = 'threadbond_db';
  }

  // 执行 Docker 命令
  async execDockerCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
        } else {
          resolve(stdout);
        }
      });
    });
  }

  // 检查 Docker 容器状态
  async checkDockerStatus() {
    console.log('🐳 检查 Docker 容器状态...\n');
    
    try {
      const containers = await this.execDockerCommand('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"');
      console.log('📊 运行中的容器:');
      console.log(containers);
      
      // 检查必要的容器是否运行
      const isBackendRunning = containers.includes(this.backendContainer);
      const isMysqlRunning = containers.includes(this.mysqlContainer);
      
      console.log(`✅ 后端容器 (${this.backendContainer}): ${isBackendRunning ? '运行中' : '未运行'}`);
      console.log(`✅ 数据库容器 (${this.mysqlContainer}): ${isMysqlRunning ? '运行中' : '未运行'}`);
      
      return { backend: isBackendRunning, mysql: isMysqlRunning };
    } catch (error) {
      console.error('❌ 检查容器状态失败:', error.error?.message || error.stderr);
      return { backend: false, mysql: false };
    }
  }

  // 初始化数据库（在 Docker 中执行 Prisma）
  async initializeDatabase() {
    console.log('\n🔧 初始化数据库（在 Docker 中执行）...');
    
    try {
      // 在后端容器中执行 Prisma 数据库推送
      console.log('📋 执行 Prisma 数据库迁移...');
      const pushResult = await this.execDockerCommand(
        `docker exec ${this.backendContainer} npx prisma db push --accept-data-loss`
      );
      console.log('✅ 数据库初始化成功');
      console.log(pushResult);
      
      return true;
    } catch (error) {
      console.log('⚠️ 数据库可能已经初始化，或者遇到错误:');
      console.log(error.stderr || error.error?.message);
      return false;
    }
  }

  // 查询已注册用户（在 Docker 中执行）
  async queryRegisteredUsers() {
    console.log('\n👥 查询已注册用户（Docker MySQL）...');
    
    try {
      // 首先检查表是否存在
      const checkTablesCommand = `docker exec ${this.mysqlContainer} mysql -u ${this.dbUser} -p${this.dbPassword} -D ${this.dbName} -e "SHOW TABLES;"`;
      
      console.log('📋 检查数据库表...');
      const tables = await this.execDockerCommand(checkTablesCommand);
      console.log('数据库表列表:');
      console.log(tables);
      
      // 查询用户数据
      if (tables.includes('users')) {
        const queryUsersCommand = `docker exec ${this.mysqlContainer} mysql -u ${this.dbUser} -p${this.dbPassword} -D ${this.dbName} -e "SELECT id, email, created_at, is_active, last_active_at FROM users ORDER BY created_at DESC LIMIT 10;"`;
        
        console.log('\n👤 查询用户列表...');
        const users = await this.execDockerCommand(queryUsersCommand);
        console.log('已注册用户:');
        console.log(users);
        
        // 统计用户数量
        const countCommand = `docker exec ${this.mysqlContainer} mysql -u ${this.dbUser} -p${this.dbPassword} -D ${this.dbName} -e "SELECT COUNT(*) as total_users FROM users;"`;
        const userCount = await this.execDockerCommand(countCommand);
        console.log('\n📊 用户统计:');
        console.log(userCount);
        
      } else {
        console.log('⚠️ 用户表不存在，可能需要初始化数据库');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ 查询用户失败:', error.stderr || error.error?.message);
      return false;
    }
  }

  // 查看后端日志（验证码会显示在这里）
  async checkBackendLogs() {
    console.log('\n📋 查看后端容器日志（验证码显示位置）...');
    
    try {
      // 获取最近的日志
      const logs = await this.execDockerCommand(`docker logs --tail 20 ${this.backendContainer}`);
      console.log('最近的后端日志:');
      console.log('=====================================');
      console.log(logs);
      console.log('=====================================');
      
      return true;
    } catch (error) {
      console.error('❌ 获取日志失败:', error.stderr || error.error?.message);
      return false;
    }
  }

  // 测试验证码功能
  async testVerificationCode() {
    console.log('\n🧪 测试验证码功能...');
    
    try {
      const testEmail = `test${Date.now()}@example.com`;
      console.log(`📧 测试邮箱: ${testEmail}`);
      
      const response = await axios.post('http://localhost:3000/api/auth/send-verification-code', {
        email: testEmail
      });

      if (response.data.success) {
        console.log('✅ 验证码生成成功');
        console.log('🔢 验证码:', response.data.data.code);
        console.log('⏰ 有效期:', response.data.data.expiresIn, '秒');
        
        console.log('\n💡 重要提示:');
        console.log('📋 验证码也会显示在后端 Docker 容器日志中');
        console.log('🔍 查看命令: docker logs threadbond-backend');
        
        return response.data.data.code;
      }
    } catch (error) {
      if (error.response) {
        console.log('⚠️ API 响应:', error.response.data.message);
      } else {
        console.log('❌ 网络错误:', error.message);
      }
      return null;
    }
  }

  // 关于真实邮件发送的说明
  showEmailServiceInfo() {
    console.log('\n📧 关于真实邮箱验证码发送的说明');
    console.log('=====================================');
    console.log('❌ 当前系统未配置真实的邮件发送服务');
    console.log('🔧 在开发环境下，验证码只会显示在:');
    console.log('   1. API 响应中（开发环境）');
    console.log('   2. 后端 Docker 容器日志中');
    console.log('');
    console.log('🛠️ 要发送真实邮件，需要配置:');
    console.log('   1. SMTP 服务器（Gmail, SendGrid, 阿里云邮件等）');
    console.log('   2. 更新 backend/src/services/emailService.ts');
    console.log('   3. 添加邮件服务环境变量');
    console.log('   4. 在发送验证码 API 中调用邮件服务');
    console.log('');
    console.log('📝 当前验证码系统特性:');
    console.log('   ⏰ 有效期: 5分钟');
    console.log('   🔄 发送间隔: 60秒');
    console.log('   💾 存储方式: 内存（开发环境）');
    console.log('   🔒 一次性使用');
  }

  // 主执行函数
  async run() {
    console.log('👥 ThreadBond 用户查询工具（Docker 版）');
    console.log('=====================================\n');

    // 1. 检查 Docker 状态
    const status = await this.checkDockerStatus();
    if (!status.backend || !status.mysql) {
      console.log('❌ 必要的 Docker 容器未运行');
      console.log('💡 请先启动容器: docker-compose up -d');
      return;
    }

    // 2. 初始化数据库
    await this.initializeDatabase();

    // 3. 查询用户
    const querySuccess = await this.queryRegisteredUsers();
    
    // 4. 如果查询失败，可能需要重新初始化
    if (!querySuccess) {
      console.log('\n🔄 尝试重新初始化数据库...');
      await this.initializeDatabase();
      await this.queryRegisteredUsers();
    }

    // 5. 测试验证码功能
    const verificationCode = await this.testVerificationCode();
    
    // 6. 查看后端日志
    if (verificationCode) {
      console.log('\n📋 查看后端日志确认验证码...');
      await this.checkBackendLogs();
    }

    // 7. 显示邮件服务说明
    this.showEmailServiceInfo();
  }
}

// 主函数
async function main() {
  const checker = new DockerUserChecker();
  await checker.run();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DockerUserChecker };