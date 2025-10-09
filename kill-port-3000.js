#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🔍 查找占用端口 3000 的进程...');

// 查找占用端口 3000 的进程
exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ 查找进程失败:', error.message);
    return;
  }

  if (!stdout.trim()) {
    console.log('✅ 端口 3000 未被占用');
    return;
  }

  console.log('📋 端口 3000 占用情况:');
  console.log(stdout);

  // 提取 PID
  const lines = stdout.trim().split('\n');
  const pids = new Set();

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0' && !isNaN(pid)) {
      pids.add(pid);
    }
  });

  if (pids.size === 0) {
    console.log('⚠️  未找到有效的 PID');
    return;
  }

  console.log(`🎯 找到 ${pids.size} 个进程:`, Array.from(pids));

  // 逐个终止进程
  pids.forEach(pid => {
    console.log(`🔪 终止进程 PID: ${pid}`);
    exec(`taskkill /f /pid ${pid}`, (killError, killStdout, killStderr) => {
      if (killError) {
        console.log(`❌ 终止进程 ${pid} 失败:`, killError.message);
      } else {
        console.log(`✅ 成功终止进程 ${pid}`);
      }
    });
  });

  // 等待一段时间后验证
  setTimeout(() => {
    exec('netstat -ano | findstr :3000', (verifyError, verifyStdout) => {
      if (verifyError || !verifyStdout.trim()) {
        console.log('🎉 端口 3000 已释放，可以启动后端服务器了');
      } else {
        console.log('⚠️  端口 3000 仍被占用，可能需要手动处理');
        console.log(verifyStdout);
      }
    });
  }, 2000);
});