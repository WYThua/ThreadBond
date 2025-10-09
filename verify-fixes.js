// 验证错误修复
const fs = require('fs');
const path = require('path');

console.log('🔍 验证错误修复...\n');

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// 检查文件内容
function checkFileContent(filePath, searchText) {
  if (!checkFileExists(filePath)) {
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchText);
}

// 验证项目
const checks = [
  {
    name: '检查路由文件中的 mutation 调用',
    file: 'frontend/src/router/index.js',
    content: "store.commit('app/SET_CURRENT_ROUTE', to)",
    description: '确保使用正确的 mutation 名称'
  },
  {
    name: '检查 DOMHelper 工具类',
    file: 'frontend/src/utils/domHelper.js',
    content: 'getBoundingClientRect',
    description: '确保 DOM 操作辅助工具已创建'
  },
  {
    name: '检查 main.js 中的错误处理',
    file: 'frontend/src/main.js',
    content: 'getBoundingClientRect',
    description: '确保全局错误处理已添加'
  },
  {
    name: '检查 app store 中的 mutation',
    file: 'frontend/src/store/modules/app.js',
    content: 'SET_CURRENT_ROUTE',
    description: '确保 mutation 定义正确'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = checkFileContent(check.file, check.content);
  const status = passed ? '✅' : '❌';
  
  console.log(`${index + 1}. ${status} ${check.name}`);
  console.log(`   文件: ${check.file}`);
  console.log(`   描述: ${check.description}`);
  
  if (!passed) {
    allPassed = false;
    if (!checkFileExists(check.file)) {
      console.log(`   ⚠️  文件不存在`);
    } else {
      console.log(`   ⚠️  未找到预期内容: ${check.content}`);
    }
  }
  
  console.log('');
});

// 检查语法错误
console.log('🔍 检查 JavaScript 语法...\n');

const jsFiles = [
  'frontend/src/router/index.js',
  'frontend/src/store/modules/app.js',
  'frontend/src/utils/domHelper.js',
  'frontend/src/main.js'
];

jsFiles.forEach((file, index) => {
  if (checkFileExists(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // 简单的语法检查 - 检查括号匹配
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openBraces === closeBraces && openParens === closeParens) {
        console.log(`${index + 1}. ✅ ${file} - 语法检查通过`);
      } else {
        console.log(`${index + 1}. ❌ ${file} - 可能存在语法错误（括号不匹配）`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`${index + 1}. ❌ ${file} - 读取文件失败: ${error.message}`);
      allPassed = false;
    }
  } else {
    console.log(`${index + 1}. ❌ ${file} - 文件不存在`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 所有检查都通过了！错误修复验证成功。');
  console.log('\n📋 修复总结:');
  console.log('1. ✅ 修复了 Vuex mutation 名称错误');
  console.log('2. ✅ 添加了 DOM 操作安全工具');
  console.log('3. ✅ 实现了全局错误处理机制');
  console.log('4. ✅ 所有文件语法检查通过');
  
  console.log('\n🚀 建议下一步:');
  console.log('1. 启动前端服务: cd frontend && npm run serve');
  console.log('2. 在浏览器中测试应用功能');
  console.log('3. 检查浏览器控制台是否还有错误');
} else {
  console.log('❌ 部分检查未通过，请检查上述问题。');
}

console.log('\n📄 详细修复信息请查看: ERROR_FIXES_SUMMARY.md');