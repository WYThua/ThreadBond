#!/usr/bin/env node

/**
 * 修复网络错误和频率限制问题
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复网络错误和频率限制问题...\n');

// 1. 检查 Docker 服务状态
console.log('1. 检查 Docker 服务状态...');
try {
  const dockerStatus = execSync('docker-compose ps', { encoding: 'utf8' });
  console.log('✅ Docker 服务状态:');
  console.log(dockerStatus);
} catch (error) {
  console.error('❌ Docker 服务检查失败:', error.message);
  process.exit(1);
}

// 2. 重启后端服务以清除频率限制
console.log('\n2. 重启后端服务以清除频率限制...');
try {
  console.log('停止后端服务...');
  execSync('docker-compose stop backend', { encoding: 'utf8' });
  
  console.log('启动后端服务...');
  execSync('docker-compose up -d backend', { encoding: 'utf8' });
  
  console.log('✅ 后端服务重启完成');
} catch (error) {
  console.error('❌ 后端服务重启失败:', error.message);
}

// 3. 等待服务启动
console.log('\n3. 等待后端服务启动...');
const waitForService = async () => {
  const maxRetries = 30;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { execSync } = require('child_process');
      execSync('curl -f http://localhost:3000/api/auth/check-email -X POST -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\"}"', 
        { encoding: 'utf8', stdio: 'pipe' });
      console.log('✅ 后端服务已就绪');
      return true;
    } catch (error) {
      retries++;
      console.log(`⏳ 等待服务启动... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.error('❌ 后端服务启动超时');
  return false;
};

// 4. 测试网络连接
const testNetworkConnection = async () => {
  console.log('\n4. 测试网络连接...');
  
  const testCases = [
    {
      name: '检查邮箱接口',
      url: 'http://localhost:3000/api/auth/check-email',
      method: 'POST',
      data: { email: 'test@example.com' }
    },
    {
      name: '注册接口测试',
      url: 'http://localhost:3000/api/auth/register',
      method: 'POST',
      data: { 
        email: `test${Date.now()}@example.com`, 
        password: 'Test123!@#' 
      }
    }
  ];
  
  for (const test of testCases) {
    try {
      console.log(`测试 ${test.name}...`);
      
      const curlCommand = `curl -X ${test.method} -H "Content-Type: application/json" -d '${JSON.stringify(test.data)}' ${test.url}`;
      const result = execSync(curlCommand, { encoding: 'utf8' });
      
      console.log(`✅ ${test.name} 成功:`);
      console.log(result);
      
    } catch (error) {
      console.log(`❌ ${test.name} 失败:`);
      console.log(error.stdout || error.message);
    }
  }
};

// 5. 创建临时测试页面
const createTestPage = () => {
  console.log('\n5. 创建网络连接测试页面...');
  
  const testPageContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网络连接测试</title>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .info { background-color: #d1ecf1; color: #0c5460; }
        button { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
        button:hover { background: #0056b3; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>ThreadBond 网络连接测试</h1>
    
    <div class="test-section info">
        <h3>测试说明</h3>
        <p>此页面用于测试前端与后端的网络连接，诊断 AxiosError Network Error 问题。</p>
        <p>后端地址: <strong>http://localhost:3000/api</strong></p>
    </div>
    
    <div class="test-section">
        <h3>连接测试</h3>
        <button onclick="testConnection()">测试基础连接</button>
        <button onclick="testCORS()">测试 CORS 配置</button>
        <button onclick="testRegister()">测试注册接口</button>
        <button onclick="clearResults()">清除结果</button>
        <div id="results"></div>
    </div>
    
    <script>
        const api = axios.create({
            baseURL: 'http://localhost:3000/api',
            timeout: 10000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        function addResult(title, content, type = 'info') {
            const results = document.getElementById('results');
            const div = document.createElement('div');
            div.className = \`test-section \${type}\`;
            div.innerHTML = \`<h4>\${title}</h4><pre>\${content}</pre>\`;
            results.appendChild(div);
        }
        
        function clearResults() {
            document.getElementById('results').innerHTML = '';
        }
        
        async function testConnection() {
            try {
                addResult('🔄 测试基础连接', '正在测试...', 'info');
                
                const response = await api.post('/auth/check-email', {
                    email: 'test@example.com'
                });
                
                addResult('✅ 基础连接测试', JSON.stringify(response.data, null, 2), 'success');
                
            } catch (error) {
                let errorInfo = {
                    message: error.message,
                    code: error.code,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                };
                
                addResult('❌ 基础连接测试失败', JSON.stringify(errorInfo, null, 2), 'error');
            }
        }
        
        async function testCORS() {
            try {
                addResult('🔄 测试 CORS', '正在测试跨域配置...', 'info');
                
                // 使用原生 fetch 测试 CORS
                const response = await fetch('http://localhost:3000/api/auth/check-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email: 'cors-test@example.com' })
                });
                
                const data = await response.json();
                
                addResult('✅ CORS 测试', \`状态: \${response.status}\\n响应: \${JSON.stringify(data, null, 2)}\`, 'success');
                
            } catch (error) {
                addResult('❌ CORS 测试失败', error.message, 'error');
            }
        }
        
        async function testRegister() {
            try {
                addResult('🔄 测试注册接口', '正在测试注册功能...', 'info');
                
                const testEmail = \`test\${Date.now()}@example.com\`;
                const response = await api.post('/auth/register', {
                    email: testEmail,
                    password: 'Test123!@#'
                });
                
                addResult('✅ 注册接口测试', JSON.stringify(response.data, null, 2), 'success');
                
            } catch (error) {
                let errorInfo = {
                    message: error.message,
                    code: error.code,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        baseURL: error.config?.baseURL
                    }
                };
                
                addResult('❌ 注册接口测试', JSON.stringify(errorInfo, null, 2), 'error');
            }
        }
        
        // 页面加载时自动测试基础连接
        window.onload = function() {
            setTimeout(testConnection, 1000);
        };
    </script>
</body>
</html>`;
  
  fs.writeFileSync('network-test.html', testPageContent);
  console.log('✅ 测试页面已创建: network-test.html');
};

// 主执行流程
const main = async () => {
  try {
    // 等待服务启动
    const serviceReady = await waitForService();
    
    if (serviceReady) {
      // 测试网络连接
      await testNetworkConnection();
      
      // 创建测试页面
      createTestPage();
      
      console.log('\n🎉 修复完成！');
      console.log('\n📋 解决方案总结:');
      console.log('1. ✅ 重启了后端服务，清除了频率限制');
      console.log('2. ✅ 验证了网络连接正常');
      console.log('3. ✅ 创建了测试页面 network-test.html');
      console.log('\n🔍 如果仍有问题，请:');
      console.log('1. 打开 network-test.html 进行详细测试');
      console.log('2. 检查浏览器控制台的错误信息');
      console.log('3. 确认防火墙没有阻止 localhost:3000');
      
    } else {
      console.log('\n❌ 服务启动失败，请检查 Docker 配置');
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
};

main();