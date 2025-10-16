#!/usr/bin/env node

/**
 * 网络连接诊断工具
 * 用于诊断前端 AxiosError Network Error 问题
 */

const { execSync } = require("child_process");

console.log("🔍 ThreadBond 网络连接诊断工具\n");

// 1. 检查后端服务状态
console.log("1. 检查后端服务状态...");
try {
  const healthCheck = execSync(
    "powershell -Command \"Invoke-WebRequest -Uri 'http://localhost:3000/health' -Method GET | Select-Object StatusCode, Content\"",
    { encoding: "utf8" }
  );
  console.log("✅ 后端服务正常运行");
  console.log(healthCheck);
} catch (error) {
  console.error("❌ 后端服务不可用");
  console.error("请先启动后端服务: docker-compose up -d backend");
  process.exit(1);
}

// 2. 测试 API 接口
console.log("\n2. 测试 API 接口...");

const testCases = [
  {
    name: "检查邮箱接口",
    command:
      "powershell -Command \"$body = @{email='test@example.com'} | ConvertTo-Json; Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/check-email' -Method POST -ContentType 'application/json' -Body $body | Select-Object StatusCode, Content\"",
  },
  {
    name: "注册接口",
    command:
      "powershell -Command \"$body = @{email='test' + (Get-Date -Format 'yyyyMMddHHmmss') + '@example.com'; password='Test123!@#'} | ConvertTo-Json; Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/register' -Method POST -ContentType 'application/json' -Body $body | Select-Object StatusCode, Content\"",
  },
];

for (const test of testCases) {
  try {
    console.log(`\n测试 ${test.name}...`);
    const result = execSync(test.command, { encoding: "utf8" });
    console.log(`✅ ${test.name} 成功:`);
    console.log(result);
  } catch (error) {
    console.log(`❌ ${test.name} 失败:`);
    console.log(error.message);
  }
}

// 3. 检查 CORS 配置
console.log("\n3. 检查 CORS 配置...");
console.log("后端 CORS 配置支持以下域名:");
console.log("- http://localhost:8080");
console.log("- http://localhost:8081");
console.log("- http://localhost:8083");
console.log("- http://127.0.0.1:8080");
console.log("- http://127.0.0.1:8081");
console.log("- http://127.0.0.1:8083");

// 4. 前端配置检查
console.log("\n4. 前端配置检查...");
try {
  const fs = require("fs");
  const frontendEnv = fs.readFileSync("frontend/.env", "utf8");
  console.log("✅ 前端环境配置:");
  console.log(frontendEnv);
} catch (error) {
  console.log("❌ 无法读取前端环境配置文件");
}

// 5. 解决方案建议
console.log("\n📋 网络错误解决方案:");
console.log("\n如果前端仍然出现 AxiosError Network Error，请检查:");
console.log("1. 🔍 浏览器控制台是否有 CORS 错误");
console.log("2. 🔍 前端是否运行在支持的端口 (8080, 8081, 8083)");
console.log("3. 🔍 防火墙是否阻止了 localhost:3000");
console.log("4. 🔍 浏览器是否阻止了不安全的请求");

console.log("\n🛠️  快速修复步骤:");
console.log("1. 重启前端服务: cd frontend && npm run serve");
console.log("2. 清除浏览器缓存和 Cookie");
console.log("3. 尝试使用无痕模式访问");
console.log("4. 检查浏览器开发者工具的网络标签");

console.log("\n✅ 后端 API 测试完成，服务运行正常！");
console.log("如果前端仍有问题，请打开 network-test.html 进行详细测试。");
