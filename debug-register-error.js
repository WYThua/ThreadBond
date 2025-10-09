#!/usr/bin/env node

/**
 * 调试注册错误工具
 * 用于详细分析 400 错误的具体原因
 */

const { execSync } = require('child_process');

console.log('🔍 调试注册 400 错误...\n');

// 测试不同的密码强度
const testCases = [
  {
    name: '弱密码测试',
    email: `weak${Date.now()}@example.com`,
    password: '123456'
  },
  {
    name: '中等密码测试',
    email: `medium${Date.now()}@example.com`,
    password: 'Password123'
  },
  {
    name: '强密码测试',
    email: `strong${Date.now()}@example.com`,
    password: 'Test123!@#'
  },
  {
    name: '无效邮箱测试',
    email: 'invalid-email',
    password: 'Test123!@#'
  },
  {
    name: '空字段测试',
    email: '',
    password: ''
  }
];

for (const testCase of testCases) {
  console.log(`\n📋 ${testCase.name}:`);
  console.log(`邮箱: ${testCase.email}`);
  console.log(`密码: ${testCase.password}`);
  
  try {
    const command = `powershell -Command "$body = @{email='${testCase.email}'; password='${testCase.password}'} | ConvertTo-Json; try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/register' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'Status:' $response.StatusCode; Write-Host 'Content:' $response.Content } catch { Write-Host 'Error Status:' $_.Exception.Response.StatusCode; Write-Host 'Error Content:' (($_.ErrorDetails.Message | ConvertFrom-Json) | ConvertTo-Json -Compress) }"`;
    
    const result = execSync(command, { encoding: 'utf8' });
    console.log('✅ 结果:');
    console.log(result);
    
  } catch (error) {
    console.log('❌ 执行失败:');
    console.log(error.message);
  }
}

// 检查后端验证规则
console.log('\n📋 后端密码验证规则:');
console.log('- 长度: 至少 8 位');
console.log('- 必须包含: 小写字母 (a-z)');
console.log('- 必须包含: 大写字母 (A-Z)');
console.log('- 必须包含: 数字 (0-9)');
console.log('- 必须包含: 特殊字符 (@$!%*?&)');

console.log('\n🔧 建议的有效密码示例:');
console.log('- Test123!@#');
console.log('- MyPass123$');
console.log('- Secure2024!');
console.log('- Strong@Pass1');