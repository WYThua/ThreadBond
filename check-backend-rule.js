#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🔍 检查后端运行规则合规性...\n');

async function checkDockerStatus() {
  console.log('1. 检查 Docker 状态...');
  
  return new Promise((resolve) => {
    exec('docker --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Docker 未安装或未运行');
        resolve(false);
      } else {
        console.log('✅ Docker 已安装:', stdout.trim());
        resolve(true);
      }
    });
  });
}

async function checkLocalBackendProcesses() {
  console.log('\n2. 检查本地后端进程...');
  
  return new Promise((resolve) => {
    // 检查是否有本地 Node.js 进程在运行后端
    exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
      if (stdout) {
        console.log('⚠️  检测到端口 3000 被占用:');
        console.log(stdout);
        
        // 进一步检查是否是 Docker 容器
        exec('docker-compose ps', (dockerError, dockerStdout) => {
          if (dockerStdout && dockerStdout.includes('backend')) {
            console.log('✅ 端口 3000 被 Docker 容器占用（符合规则）');
            resolve(true);
          } else {
            console.log('❌ 端口 3000 可能被本地进程占用（违反规则）');
            console.log('   请停止本地后端进程，使用 Docker 启动');
            resolve(false);
          }
        });
      } else {
        console.log('✅ 端口 3000 未被占用');
        resolve(true);
      }
    });
  });
}

async function checkLocalDatabases() {
  console.log('\n3. 检查本地数据库服务...');
  
  const checks = [
    { port: 3306, service: 'MySQL' },
    { port: 6379, service: 'Redis' }
  ];
  
  let allGood = true;
  
  for (const check of checks) {
    await new Promise((resolve) => {
      exec(`netstat -ano | findstr :${check.port}`, (error, stdout) => {
        if (stdout) {
          console.log(`⚠️  检测到 ${check.service} 端口 ${check.port} 被占用`);
          
          // 检查是否是 Docker 容器
          exec('docker-compose ps', (dockerError, dockerStdout) => {
            if (dockerStdout && (dockerStdout.includes('mysql') || dockerStdout.includes('redis'))) {
              console.log(`✅ ${check.service} 在 Docker 容器中运行（符合规则）`);
            } else {
              console.log(`❌ ${check.service} 可能在本地运行（违反规则）`);
              allGood = false;
            }
            resolve();
          });
        } else {
          console.log(`✅ ${check.service} 端口 ${check.port} 未被占用`);
          resolve();
        }
      });
    });
  }
  
  return allGood;
}

async function checkDockerContainers() {
  console.log('\n4. 检查 Docker 容器状态...');
  
  return new Promise((resolve) => {
    exec('docker-compose ps', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  无法获取 Docker 容器状态');
        resolve(false);
      } else {
        console.log('Docker 容器状态:');
        console.log(stdout);
        
        const hasBackend = stdout.includes('backend');
        const hasMySQL = stdout.includes('mysql');
        const hasRedis = stdout.includes('redis');
        
        if (hasBackend && hasMySQL && hasRedis) {
          console.log('✅ 所有后端服务都在 Docker 中运行');
          resolve(true);
        } else {
          console.log('⚠️  部分后端服务未在 Docker 中运行');
          resolve(false);
        }
      }
    });
  });
}

async function provideSuggestions(dockerOk, processesOk, databasesOk, containersOk) {
  console.log('\n📋 合规性检查结果:');
  console.log(`- Docker 状态: ${dockerOk ? '✅' : '❌'}`);
  console.log(`- 本地进程检查: ${processesOk ? '✅' : '❌'}`);
  console.log(`- 数据库服务检查: ${databasesOk ? '✅' : '❌'}`);
  console.log(`- Docker 容器状态: ${containersOk ? '✅' : '❌'}`);
  
  if (dockerOk && processesOk && databasesOk && containersOk) {
    console.log('\n🎉 完全符合后端运行规则！');
  } else {
    console.log('\n⚠️  发现规则违规，建议操作:');
    
    if (!dockerOk) {
      console.log('- 安装并启动 Docker Desktop');
    }
    
    if (!processesOk) {
      console.log('- 停止本地后端进程: taskkill /f /im node.exe');
      console.log('- 使用 Docker 启动后端: npm run dev:backend');
    }
    
    if (!databasesOk) {
      console.log('- 停止本地数据库服务');
      console.log('- 使用 Docker 启动数据库: docker-compose up mysql redis');
    }
    
    if (!containersOk) {
      console.log('- 启动 Docker 后端服务: npm run dev:backend');
    }
  }
}

async function main() {
  try {
    const dockerOk = await checkDockerStatus();
    const processesOk = await checkLocalBackendProcesses();
    const databasesOk = await checkLocalDatabases();
    const containersOk = dockerOk ? await checkDockerContainers() : false;
    
    await provideSuggestions(dockerOk, processesOk, databasesOk, containersOk);
    
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

main();