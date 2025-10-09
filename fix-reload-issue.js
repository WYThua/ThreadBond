#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复前端重复加载问题...\n');

// 1. 检查并修复 main.js 中的重复初始化
const mainJsPath = path.join(__dirname, 'frontend/src/main.js');
let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// 添加防重复加载逻辑
if (!mainJsContent.includes('__VUE_APP_MOUNTED__')) {
  const mountCode = `
// 防止重复挂载
if (window.__VUE_APP_MOUNTED__) {
  console.warn('Vue 应用已挂载，跳过重复挂载');
} else {
  window.__VUE_APP_MOUNTED__ = true;
  
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
}`;

  // 替换原有的 new Vue 代码
  mainJsContent = mainJsContent.replace(
    /new Vue\(\{[\s\S]*?\}\)\.\$mount\('#app'\);/,
    mountCode.trim()
  );
  
  fs.writeFileSync(mainJsPath, mainJsContent);
  console.log('✅ 修复 main.js 重复挂载问题');
}

// 2. 修复 vue.config.js 中的热重载配置
const vueConfigPath = path.join(__dirname, 'frontend/vue.config.js');
let vueConfigContent = fs.readFileSync(vueConfigPath, 'utf8');

// 确保禁用了 liveReload
if (!vueConfigContent.includes('liveReload: false')) {
  console.log('⚠️  vue.config.js 中的 liveReload 配置可能需要手动检查');
}

// 3. 创建启动脚本，确保只启动一次
const startScriptPath = path.join(__dirname, 'start-frontend-safe.js');
const startScriptContent = `#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 检查是否已有进程在运行
const { execSync } = require('child_process');

try {
  // 检查端口 8080 是否被占用
  const result = execSync('netstat -an | findstr :8080', { encoding: 'utf8' });
  if (result.includes('LISTENING')) {
    console.log('⚠️  端口 8080 已被占用，请先停止现有进程');
    console.log('可以运行: taskkill /f /im node.exe');
    process.exit(1);
  }
} catch (error) {
  // 端口未被占用，继续启动
}

console.log('🚀 启动前端开发服务器...');

const frontendProcess = spawn('npm', ['run', 'serve'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontendProcess.on('error', (error) => {
  console.error('启动失败:', error);
});

frontendProcess.on('exit', (code) => {
  console.log(\`前端服务器退出，代码: \${code}\`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\\n正在停止前端服务器...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});
`;

fs.writeFileSync(startScriptPath, startScriptContent);
console.log('✅ 创建安全启动脚本: start-frontend-safe.js');

// 4. 创建清理脚本
const cleanupScriptPath = path.join(__dirname, 'cleanup-processes.js');
const cleanupScriptContent = `#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 清理可能冲突的进程...');

try {
  // 停止所有 node 进程（Windows）
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
  console.log('✅ 已停止 Node.js 进程');
} catch (error) {
  console.log('ℹ️  没有找到需要停止的 Node.js 进程');
}

try {
  // 清理端口占用
  execSync('netsh int ipv4 reset', { stdio: 'ignore' });
  console.log('✅ 已重置网络配置');
} catch (error) {
  console.log('⚠️  网络配置重置失败，可能需要管理员权限');
}

console.log('🎉 清理完成，现在可以重新启动前端服务器');
`;

fs.writeFileSync(cleanupScriptPath, cleanupScriptContent);
console.log('✅ 创建清理脚本: cleanup-processes.js');

console.log('\n🎉 重复加载问题修复完成！');
console.log('\n📋 使用说明:');
console.log('1. 如果仍有问题，先运行: node cleanup-processes.js');
console.log('2. 然后启动前端: node start-frontend-safe.js');
console.log('3. 或者直接运行: cd frontend && npm run serve');