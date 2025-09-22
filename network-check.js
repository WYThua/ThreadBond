// 网络连接检查脚本
const https = require('https');
const http = require('http');

function checkConnection(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      console.log(`✅ ${name}: 连接成功 (状态码: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: 连接失败 - ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${name}: 连接超时`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🔍 检查网络连接状态...\n');
  
  const checks = [
    { url: 'https://registry-1.docker.io', name: 'Docker Hub' },
    { url: 'https://auth.docker.io', name: 'Docker Auth' },
    { url: 'https://registry.npmmirror.com', name: 'NPM 镜像源' },
    { url: 'https://www.baidu.com', name: '百度 (测试基础网络)' },
    { url: 'https://github.com', name: 'GitHub' }
  ];
  
  const results = [];
  for (const check of checks) {
    const result = await checkConnection(check.url, check.name);
    results.push(result);
  }
  
  console.log('\n📊 网络检查结果:');
  console.log(`成功: ${results.filter(r => r).length}/${results.length}`);
  console.log(`失败: ${results.filter(r => !r).length}/${results.length}`);
  
  if (results.filter(r => r).length === 0) {
    console.log('\n❌ 网络连接完全不可用，请检查网络设置');
  } else if (!results[0] || !results[1]) {
    console.log('\n⚠️  Docker Hub 连接有问题，建议使用镜像源或本地开发');
  } else {
    console.log('\n✅ 网络连接正常');
  }
}

main().catch(console.error);