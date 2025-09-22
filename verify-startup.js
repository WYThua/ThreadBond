// ThreadBond 项目启动验证脚本
const http = require('http');

class StartupVerifier {
  constructor() {
    this.services = [
      { name: '前端应用', url: 'http://localhost:8080', type: 'frontend' },
      { name: '后端 API', url: 'http://localhost:3000/health', type: 'backend' },
      { name: '邮箱检查 API', url: 'http://localhost:3000/api/auth/check-email', type: 'api', method: 'POST', data: { email: 'test@example.com' } }
    ];
  }

  async checkService(service) {
    return new Promise((resolve) => {
      const url = new URL(service.url);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: service.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'StartupVerifier/1.0'
        },
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            body: body
          });
        });
      });

      req.on('error', () => {
        resolve({ success: false, error: 'Connection failed' });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });

      if (service.data) {
        req.write(JSON.stringify(service.data));
      }
      
      req.end();
    });
  }

  async verifyAllServices() {
    console.log('🚀 ThreadBond 项目启动验证\n');
    
    let allGood = true;
    
    for (const service of this.services) {
      process.stdout.write(`检查 ${service.name}... `);
      
      const result = await this.checkService(service);
      
      if (result.success) {
        console.log('✅ 正常');
      } else {
        console.log(`❌ 异常 (${result.error || result.status})`);
        allGood = false;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (allGood) {
      console.log('🎉 ThreadBond 项目启动成功！');
      console.log('\n📱 立即体验:');
      console.log('   前端应用: http://localhost:8080');
      console.log('   注册页面: http://localhost:8080/register');
      console.log('   登录页面: http://localhost:8080/login');
      console.log('\n🔧 开发工具:');
      console.log('   后端 API: http://localhost:3000');
      console.log('   健康检查: http://localhost:3000/health');
      console.log('\n✨ 功能特色:');
      console.log('   - 移动端优化的响应式设计');
      console.log('   - 实时密码强度检测');
      console.log('   - 完整的表单验证');
      console.log('   - 匿名身份自动生成');
      console.log('   - JWT 安全认证');
    } else {
      console.log('❌ 部分服务启动异常，请检查日志');
    }
    
    return allGood;
  }
}

// 运行验证
async function main() {
  const verifier = new StartupVerifier();
  await verifier.verifyAllServices();
}

main().catch(console.error);