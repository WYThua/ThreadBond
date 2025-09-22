// API 测试脚本
const https = require('https');
const http = require('http');

class APITester {
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

  // 测试健康检查接口
  async testHealth() {
    console.log('🏥 测试健康检查接口...');
    try {
      const response = await this.request('GET', '/health');
      if (response.status === 200) {
        console.log('✅ 健康检查: 通过');
        console.log(`   响应: ${JSON.stringify(response.data)}`);
        return true;
      } else {
        console.log(`❌ 健康检查: 失败 (状态码: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 健康检查: 连接失败 - ${error.message}`);
      return false;
    }
  }

  // 测试用户注册接口
  async testRegister() {
    console.log('📝 测试用户注册接口...');
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#'
    };

    try {
      const response = await this.request('POST', '/api/auth/register', testUser);
      if (response.status === 201) {
        console.log('✅ 用户注册: 通过');
        console.log(`   用户邮箱: ${testUser.email}`);
        console.log(`   用户ID: ${response.data.data?.user?.id}`);
        console.log(`   匿名身份: ${response.data.data?.anonymousIdentity?.displayName}`);
        return { success: true, data: response.data.data };
      } else {
        console.log(`❌ 用户注册: 失败 (状态码: ${response.status})`);
        console.log(`   错误信息: ${response.data.message}`);
        return { success: false };
      }
    } catch (error) {
      console.log(`❌ 用户注册: 请求失败 - ${error.message}`);
      return { success: false };
    }
  }

  // 测试用户登录接口
  async testLogin(email, password) {
    console.log('🔐 测试用户登录接口...');
    const loginData = { email, password };

    try {
      const response = await this.request('POST', '/api/auth/login', loginData);
      if (response.status === 200) {
        console.log('✅ 用户登录: 通过');
        console.log(`   令牌: ${response.data.data?.token?.substring(0, 20)}...`);
        return { success: true, data: response.data.data };
      } else {
        console.log(`❌ 用户登录: 失败 (状态码: ${response.status})`);
        console.log(`   错误信息: ${response.data.message}`);
        return { success: false };
      }
    } catch (error) {
      console.log(`❌ 用户登录: 请求失败 - ${error.message}`);
      return { success: false };
    }
  }

  // 测试邮箱检查接口
  async testCheckEmail() {
    console.log('📧 测试邮箱检查接口...');
    const testEmail = `available${Date.now()}@example.com`;

    try {
      const response = await this.request('POST', '/api/auth/check-email', { email: testEmail });
      if (response.status === 200) {
        console.log('✅ 邮箱检查: 通过');
        console.log(`   邮箱可用性: ${response.data.data?.available}`);
        return true;
      } else {
        console.log(`❌ 邮箱检查: 失败 (状态码: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 邮箱检查: 请求失败 - ${error.message}`);
      return false;
    }
  }

  // 测试数据验证
  async testValidation() {
    console.log('🛡️ 测试数据验证...');
    
    // 测试无效邮箱
    try {
      const response = await this.request('POST', '/api/auth/register', {
        email: 'invalid-email',
        password: 'Test123!@#'
      });
      
      if (response.status === 400) {
        console.log('✅ 邮箱验证: 通过 (正确拒绝无效邮箱)');
      } else {
        console.log('❌ 邮箱验证: 失败 (应该拒绝无效邮箱)');
        return false;
      }
    } catch (error) {
      console.log(`❌ 邮箱验证测试失败: ${error.message}`);
      return false;
    }

    // 测试弱密码
    try {
      const response = await this.request('POST', '/api/auth/register', {
        email: `weak${Date.now()}@example.com`,
        password: '123456'
      });
      
      if (response.status === 400) {
        console.log('✅ 密码验证: 通过 (正确拒绝弱密码)');
        return true;
      } else {
        console.log('❌ 密码验证: 失败 (应该拒绝弱密码)');
        return false;
      }
    } catch (error) {
      console.log(`❌ 密码验证测试失败: ${error.message}`);
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始 ThreadBond API 测试...\n');
    
    const results = [];
    let registeredUser = null;

    // 1. 健康检查
    results.push(await this.testHealth());
    console.log('');

    // 2. 邮箱检查
    results.push(await this.testCheckEmail());
    console.log('');

    // 3. 数据验证
    results.push(await this.testValidation());
    console.log('');

    // 4. 用户注册
    const registerResult = await this.testRegister();
    results.push(registerResult.success);
    if (registerResult.success) {
      registeredUser = registerResult.data;
    }
    console.log('');

    // 5. 用户登录 (如果注册成功)
    if (registeredUser) {
      const loginResult = await this.testLogin(
        registeredUser.user.email, 
        'Test123!@#'
      );
      results.push(loginResult.success);
    } else {
      console.log('⏭️ 跳过登录测试 (注册失败)');
      results.push(false);
    }

    // 输出测试结果
    console.log('\n📊 API 测试结果汇总:');
    console.log(`总测试数: ${results.length}`);
    console.log(`通过数: ${results.filter(r => r).length}`);
    console.log(`失败数: ${results.filter(r => !r).length}`);
    
    const allPassed = results.every(result => result);
    console.log(`整体状态: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);
    
    if (allPassed) {
      console.log('\n🎉 恭喜！ThreadBond 后端 API 运行正常！');
      console.log('📱 前端地址: http://localhost:8080');
      console.log('🔧 后端地址: http://localhost:3000');
    }

    return allPassed;
  }
}

// 运行测试
async function main() {
  const tester = new APITester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);