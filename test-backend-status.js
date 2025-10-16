#!/usr/bin/env node

/**
 * 测试后端服务状态
 */

const http = require('http');

console.log('🔍 检查后端服务状态...\n');

// 测试后端健康检查
function testBackend() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/check-email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ email: 'test@example.com' }));
    req.end();
  });
}

async function main() {
  try {
    console.log('📡 测试后端 API 连接...');
    const result = await testBackend();
    
    console.log(`✅ 后端响应状态: ${result.status}`);
    console.log(`📄 响应内容: ${result.data}`);
    
    if (result.status === 200 || result.status === 400) {
      console.log('\n🎉 后端服务正常运行！');
      console.log('\n💡 如果登录仍有问题，请检查:');
      console.log('1. 浏览器控制台的错误信息');
      console.log('2. 网络面板的 API 请求');
      console.log('3. 表单验证是否通过');
    } else {
      console.log('\n⚠️ 后端服务可能有问题');
    }
    
  } catch (error) {
    console.error('❌ 无法连接到后端服务:', error.message);
    console.log('\n🔧 请确保:');
    console.log('1. 后端服务已启动: node start-with-docker.js');
    console.log('2. 端口 3000 未被占用');
    console.log('3. Docker 容器正常运行');
  }
}

main();