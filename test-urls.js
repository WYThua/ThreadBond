// URL 测试脚本
const http = require('http');

async function testURL(url, description) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`${description}: ✅ 状态码 ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            if (data.message) {
              console.log(`   消息: ${data.message}`);
            }
          } catch (e) {
            console.log(`   响应: HTML 页面 (${body.length} 字符)`);
          }
        }
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log(`${description}: ❌ 连接失败 - ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`${description}: ❌ 超时`);
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 测试具体 URL...\n');
  
  await testURL('http://localhost:3000/', '后端根路径');
  await testURL('http://localhost:3000/health', '后端健康检查');
  await testURL('http://localhost:8080/', '前端应用');
  
  console.log('\n✅ URL 测试完成！');
}

main().catch(console.error);