/**
 * 启动验证码注册应用
 * 后端在 Docker 中运行，前端在本地运行
 */

const { spawn, exec } = require('child_process');
const path = require('path');

class AppStarter {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  // 执行命令并返回 Promise
  execCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 执行命令: ${command}`);
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ 命令执行失败: ${error.message}`);
          reject(error);
        } else {
          if (stdout) console.log(stdout);
          if (stderr) console.error(stderr);
          resolve(stdout);
        }
      });
    });
  }

  // 启动 Docker 后端服务
  async startBackend() {
    console.log('🐳 启动 Docker 后端服务...');
    
    try {
      // 检查 Docker 是否运行
      await this.execCommand('docker --version');
      console.log('✅ Docker 已安装');

      // 检查 Docker Compose 是否可用
      await this.execCommand('docker-compose --version');
      console.log('✅ Docker Compose 已安装');

      // 停止现有容器（如果有）
      console.log('🛑 停止现有容器...');
      try {
        await this.execCommand('docker-compose down');
      } catch (error) {
        console.log('ℹ️  没有运行中的容器需要停止');
      }

      // 构建并启动后端服务
      console.log('🔨 构建并启动后端服务...');
      await this.execCommand('docker-compose up --build -d mysql redis backend');
      
      // 等待服务启动
      console.log('⏳ 等待后端服务启动...');
      await this.waitForBackend();
      
      console.log('✅ 后端服务启动成功');
      return true;
    } catch (error) {
      console.error('❌ 后端服务启动失败:', error.message);
      return false;
    }
  }

  // 等待后端服务就绪
  async waitForBackend() {
    const maxAttempts = 30;
    const delay = 2000; // 2秒

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await this.execCommand('curl -f http://localhost:3000/health');
        console.log('✅ 后端服务健康检查通过');
        return true;
      } catch (error) {
        console.log(`⏳ 等待后端服务启动... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('后端服务启动超时');
  }

  // 启动前端服务
  async startFrontend() {
    console.log('🎨 启动前端服务...');
    
    return new Promise((resolve, reject) => {
      // 切换到前端目录并启动开发服务器
      const frontendProcess = spawn('npm', ['run', 'serve'], {
        cwd: path.join(process.cwd(), 'frontend'),
        stdio: 'pipe',
        shell: true
      });

      let frontendReady = false;

      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[前端] ${output.trim()}`);
        
        // 检查前端是否启动成功
        if (output.includes('Local:') || output.includes('localhost:8080')) {
          if (!frontendReady) {
            frontendReady = true;
            console.log('✅ 前端服务启动成功');
            resolve(frontendProcess);
          }
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.error(`[前端错误] ${output.trim()}`);
      });

      frontendProcess.on('close', (code) => {
        console.log(`前端进程退出，代码: ${code}`);
        if (!frontendReady) {
          reject(new Error(`前端启动失败，退出代码: ${code}`));
        }
      });

      frontendProcess.on('error', (error) => {
        console.error('前端启动错误:', error);
        reject(error);
      });

      // 保存进程引用以便后续清理
      this.processes.push(frontendProcess);

      // 超时处理
      setTimeout(() => {
        if (!frontendReady) {
          reject(new Error('前端启动超时'));
        }
      }, 60000); // 60秒超时
    });
  }

  // 测试验证码功能
  async testVerificationCode() {
    console.log('\n🧪 测试验证码功能...');
    
    try {
      // 等待一下确保服务完全启动
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 测试后端 API
      await this.execCommand('node test-backend-verification-api.js');
      
      console.log('✅ 验证码功能测试通过');
    } catch (error) {
      console.error('❌ 验证码功能测试失败:', error.message);
    }
  }

  // 显示访问信息
  showAccessInfo() {
    console.log('\n🎉 应用启动完成！');
    console.log('=====================================');
    console.log('📱 前端地址: http://localhost:8080');
    console.log('🔗 注册页面: http://localhost:8080/register');
    console.log('🔗 登录页面: http://localhost:8080/login');
    console.log('🌐 后端 API: http://localhost:3000');
    console.log('🏥 健康检查: http://localhost:3000/health');
    console.log('📊 Docker 状态: docker ps');
    console.log('=====================================');
    console.log('💡 验证码注册功能已启用');
    console.log('📧 开发环境下验证码会在控制台显示');
    console.log('⏰ 验证码有效期: 5分钟');
    console.log('🔄 发送间隔: 60秒');
    console.log('=====================================');
    console.log('🛑 停止应用: Ctrl+C');
  }

  // 优雅关闭
  async gracefulShutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('\n🛑 正在关闭应用...');

    // 关闭前端进程
    this.processes.forEach(process => {
      if (process && !process.killed) {
        console.log('🔄 关闭前端服务...');
        process.kill('SIGTERM');
      }
    });

    // 关闭 Docker 服务（可选，保持运行以便快速重启）
    try {
      console.log('🐳 Docker 服务保持运行（使用 docker-compose down 手动停止）');
      // await this.execCommand('docker-compose down');
    } catch (error) {
      console.error('关闭 Docker 服务时出错:', error.message);
    }

    console.log('✅ 应用已关闭');
    process.exit(0);
  }

  // 启动应用
  async start() {
    console.log('🚀 启动 ThreadBond 验证码注册应用');
    console.log('=====================================\n');

    try {
      // 1. 启动后端服务
      const backendStarted = await this.startBackend();
      if (!backendStarted) {
        throw new Error('后端服务启动失败');
      }

      // 2. 启动前端服务
      await this.startFrontend();

      // 3. 测试验证码功能
      await this.testVerificationCode();

      // 4. 显示访问信息
      this.showAccessInfo();

      // 5. 设置优雅关闭
      process.on('SIGINT', () => this.gracefulShutdown());
      process.on('SIGTERM', () => this.gracefulShutdown());

    } catch (error) {
      console.error('❌ 应用启动失败:', error.message);
      await this.gracefulShutdown();
    }
  }
}

// 检查环境
function checkEnvironment() {
  console.log('🔍 检查环境...');
  
  // 检查 Node.js 版本
  const nodeVersion = process.version;
  console.log(`📦 Node.js 版本: ${nodeVersion}`);
  
  // 检查是否在项目根目录
  const fs = require('fs');
  if (!fs.existsSync('docker-compose.yml')) {
    console.error('❌ 请在项目根目录运行此脚本');
    process.exit(1);
  }
  
  if (!fs.existsSync('frontend/package.json')) {
    console.error('❌ 前端目录不存在');
    process.exit(1);
  }
  
  console.log('✅ 环境检查通过');
}

// 主函数
async function main() {
  checkEnvironment();
  
  const starter = new AppStarter();
  await starter.start();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}

module.exports = { AppStarter };