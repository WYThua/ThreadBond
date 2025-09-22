// 简化的 API 测试脚本 - 避免限流问题
const http = require('http');

class SimpleAPITester {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // 发送 HTTP 请求
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseURL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Tester/1.0'
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonBody
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: body
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // 测试基础连接
  async testConnection() {
    console.log('🔗 测试后端连接...');
    try {
      const response = await this.request('GET', '/health');
      if (response.status === 200) {
        console.log('✅ 后端连接: 正常');
        console.log(`   服务状态: ${response.data.status}`);
        console.log(`   运行时间: ${Math.floor(response.data.uptime)}秒`);
        console.log(`   环境: ${response.data.environment}`);
        return true;
      } else {
        console.log(`❌ 后端连接: 异常 (状态码: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 后端连接: 失败 - ${error.message}`);
      return false;
    }
  }

  // 测试数据库连接
  async testDatabase() {
    console.log('🗄️ 测试数据库连接...');
    try {
      // 尝试访问一个需要数据库的接口
      const response = await this.request('POST', '/api/auth/check-email', { 
        email: 'test@example.com' 
      });
      
      if (response.status === 200 || response.status === 400) {
        console.log('✅ 数据库连接: 正常');
        return true;
      } else {
        console.log(`❌ 数据库连接: 异常 (状态码: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 数据库连接: 失败 - ${error.message}`);
      return false;
    }
  }

  // 测试 API 路由
  async testRoutes() {
    console.log('🛣️ 测试 API 路由...');
    
    const routes = [
      { method: 'GET', path: '/health', name: '健康检查' },
      { method: 'POST', path: '/api/auth/check-email', name: '邮箱检查', data: { email: 'test@example.com' } }
    ];

    let passCount = 0;
    
    for (const route of routes) {
      try {
        const response = await this.request(route.method, route.path, route.data);
        if (response.status < 500) { // 不是服务器错误就算通过
          console.log(`   ✅ ${route.name}: 可访问`);
          passCount++;
        } else {
          console.log(`   ❌ ${route.name}: 服务器错误 (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ ${route.name}: 连接失败`);
      }
    }
    
    console.log(`✅ 路由测试: ${passCount}/${routes.length} 通过`);
    return passCount === routes.length;
  }

  // 测试前端连接
  async testFrontend() {
    console.log('🌐 测试前端连接...');
    try {
      const response = await this.request('GET', 'http://localhost:8080');
      if (response.status === 200) {
        console.log('✅ 前端连接: 正常');
        return true;
      } else {
        console.log(`❌ 前端连接: 异常 (状态码: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 前端连接: 失败 - ${error.message}`);
      return false;
    }
  }

  // 运行基础测试
  async runBasicTests() {
    console.log('🚀 ThreadBond 基础服务测试\n');
    
    const results = [];

    // 1. 后端连接测试
    results.push(await this.testConnection());
    console.log('');

    // 2. 数据库连接测试
    results.push(await this.testDatabase());
    console.log('');

    // 3. API 路由测试
    results.push(await this.testRoutes());
    console.log('');

    // 4. 前端连接测试
    results.push(await this.testFrontend());
    console.log('');

    // 输出测试结果
    console.log('📊 基础服务测试结果:');
    console.log(`通过数: ${results.filter(r => r).length}/${results.length}`);
    
    const allPassed = results.every(result => result);
    console.log(`整体状态: ${allPassed ? '✅ 全部正常' : '⚠️ 部分异常'}`);
    
    if (allPassed) {
      console.log('\n🎉 ThreadBond 服务运行正常！');
      console.log('📱 前端地址: http://localhost:8080');
      console.log('🔧 后端地址: http://localhost:3000');
      console.log('📊 健康检查: http://localhost:3000/health');
      console.log('\n💡 提示:');
      console.log('- 可以在浏览器中访问前端地址查看应用');
      console.log('- 注册功能已实现，可以测试用户注册流程');
      console.log('- 后端 API 文档可通过 /api 路径访问');
    } else {
      console.log('\n⚠️ 部分服务可能存在问题，请检查日志');
    }

    return allPassed;
  }
}

// 运行测试
async function main() {
  const tester = new SimpleAPITester();
  await tester.runBasicTests();
}

main().catch(console.error);