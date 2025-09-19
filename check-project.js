#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ThreadBond 项目完整性检查');
console.log('=====================================\n');

// 检查必要文件
const requiredFiles = [
  // 根目录文件
  'package.json',
  'docker-compose.yml',
  'README.md',
  '.gitignore',
  
  // 后端文件
  'backend/package.json',
  'backend/Dockerfile',
  'backend/tsconfig.json',
  'backend/.env',
  'backend/src/index.ts',
  'backend/prisma/schema.prisma',
  
  // 前端文件
  'frontend/package.json',
  'frontend/Dockerfile',
  'frontend/vue.config.js',
  'frontend/.env',
  'frontend/src/main.js',
  'frontend/src/App.vue',
  'frontend/public/index.html',
  
  // Docker 配置
  'docker/mysql/init.sql'
];

let missingFiles = [];
let existingFiles = [];

console.log('📁 检查必要文件...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - 缺失`);
  }
});

console.log(`\n📊 文件检查结果:`);
console.log(`✅ 存在: ${existingFiles.length} 个文件`);
console.log(`❌ 缺失: ${missingFiles.length} 个文件`);

if (missingFiles.length > 0) {
  console.log('\n⚠️  缺失的文件:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// 检查 package.json 内容
console.log('\n📦 检查 package.json 配置...');

try {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ 根目录 package.json - 项目名: ${rootPackage.name}`);
} catch (error) {
  console.log('❌ 根目录 package.json 解析失败');
}

try {
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  console.log(`✅ 后端 package.json - 项目名: ${backendPackage.name}`);
} catch (error) {
  console.log('❌ 后端 package.json 解析失败');
}

try {
  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  console.log(`✅ 前端 package.json - 项目名: ${frontendPackage.name}`);
} catch (error) {
  console.log('❌ 前端 package.json 解析失败');
}

// 检查环境配置
console.log('\n🔧 检查环境配置...');

if (fs.existsSync('backend/.env')) {
  console.log('✅ 后端环境配置文件存在');
} else {
  console.log('❌ 后端环境配置文件缺失');
}

if (fs.existsSync('frontend/.env')) {
  console.log('✅ 前端环境配置文件存在');
} else {
  console.log('❌ 前端环境配置文件缺失');
}

// 总结
console.log('\n🎯 项目状态总结:');
if (missingFiles.length === 0) {
  console.log('🎉 项目配置完整，可以启动！');
  console.log('\n🚀 启动命令:');
  console.log('   Windows: start-project.bat');
  console.log('   Linux/Mac: ./start-project.sh');
  console.log('   或直接运行: docker-compose up --build');
  console.log('\n📍 访问地址:');
  console.log('   前端: http://localhost:8080');
  console.log('   后端: http://localhost:3000');
  console.log('   健康检查: http://localhost:3000/health');
} else {
  console.log('⚠️  项目配置不完整，请检查缺失的文件');
}

console.log('\n=====================================');
console.log('检查完成！');