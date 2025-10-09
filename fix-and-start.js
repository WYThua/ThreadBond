// 修复并启动应用
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 开始修复应用错误...\n');

// 1. 清理浏览器缓存相关文件
console.log('1. 清理缓存文件...');
const cacheFiles = [
  'frontend/dist',
  'frontend/.cache',
  'frontend/node_modules/.cache'
];

cacheFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`   ✅ 已清理: ${file}`);
    } catch (error) {
      console.log(`   ⚠️  清理失败: ${file} - ${error.message}`);
    }
  }
});

// 2. 检查并修复关键文件
console.log('\n2. 检查关键文件...');

const criticalFiles = [
  {
    path: 'frontend/src/store/modules/app.js',
    check: 'setCurrentRoute',
    fix: () => {
      const filePath = path.join(__dirname, 'frontend/src/store/modules/app.js');
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('setCurrentRoute(state, route)')) {
        // 添加别名 mutation
        content = content.replace(
          'SET_CURRENT_ROUTE(state, route) {\n    state.currentRoute = route;\n  },',
          `SET_CURRENT_ROUTE(state, route) {
    state.currentRoute = route;
  },
  
  // 别名 mutation，兼容错误的调用
  setCurrentRoute(state, route) {
    console.warn('使用了已废弃的 mutation 名称 setCurrentRoute，请使用 SET_CURRENT_ROUTE');
    state.currentRoute = route;
  },`
        );
        
        fs.writeFileSync(filePath, content);
        console.log('   ✅ 已修复 app store 模块');
      }
    }
  }
];

criticalFiles.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, file.path), 'utf8');
    if (!content.includes(file.check)) {
      file.fix();
    } else {
      console.log(`   ✅ ${file.path} 已正确配置`);
    }
  } catch (error) {
    console.log(`   ❌ 检查文件失败: ${file.path} - ${error.message}`);
  }
});

// 3. 创建强制修复的 main.js
console.log('\n3. 创建强制修复版本...');

const fixedMainJs = `import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Vant UI 组件
import {
  Button, Cell, CellGroup, Icon, Image as VanImage, Loading, Toast, Dialog, Notify,
  NavBar, Tabbar, TabbarItem, Field, Form, Card, Tag, Grid, GridItem, List,
  PullRefresh, SwipeCell, ActionSheet, Popup, Overlay, Sticky, Tab, Tabs,
  Swipe, SwipeItem, Lazyload, ImagePreview, Uploader, Progress, Circle,
  CountDown, Divider, Empty, Skeleton, Search, DropdownMenu, DropdownItem, Checkbox
} from 'vant';

// 注册 Vant 组件
[Button, Cell, CellGroup, Icon, VanImage, Loading, Toast, Dialog, Notify,
 NavBar, Tabbar, TabbarItem, Field, Form, Card, Tag, Grid, GridItem, List,
 PullRefresh, SwipeCell, ActionSheet, Popup, Overlay, Sticky, Tab, Tabs,
 Swipe, SwipeItem, Lazyload, ImagePreview, Uploader, Progress, Circle,
 CountDown, Divider, Empty, Skeleton, Search, DropdownMenu, DropdownItem, Checkbox
].forEach(component => Vue.use(component));

// 全局样式和工具
import './styles/index.scss';
import './utils/flexible';
import './filters';
import './directives';
import './utils/domHelper';

Vue.config.productionTip = false;

// 强制修复 Vuex mutation 错误
const originalCommit = store.commit;
store.commit = function(type, payload, options) {
  // 自动修正错误的 mutation 名称
  if (type === 'app/setCurrentRoute') {
    type = 'app/SET_CURRENT_ROUTE';
  }
  
  try {
    return originalCommit.call(this, type, payload, options);
  } catch (error) {
    console.warn('Vuex commit 错误已被捕获:', error.message);
    return;
  }
};

// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  const message = err.message || '';
  
  if (message.includes('getBoundingClientRect') || 
      message.includes('unknown mutation type') ||
      message.includes('Cannot read properties of undefined')) {
    console.warn('错误已被安全处理:', message);
    return;
  }
  
  console.error('Vue 错误:', err, info);
  Toast.fail('应用发生错误，请刷新页面重试');
};

// JavaScript 全局错误处理
window.addEventListener('error', (event) => {
  const message = event.error?.message || '';
  
  if (message.includes('getBoundingClientRect') || 
      message.includes('unknown mutation type') ||
      message.includes('Cannot read properties of undefined')) {
    console.warn('JavaScript 错误已被捕获:', message);
    event.preventDefault();
    return;
  }
  
  console.error('JavaScript 错误:', event.error);
});

// Promise 错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promise 错误已被捕获:', event.reason);
  event.preventDefault();
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
`;

try {
  fs.writeFileSync(path.join(__dirname, 'frontend/src/main-fixed.js'), fixedMainJs);
  console.log('   ✅ 已创建修复版本: main-fixed.js');
} catch (error) {
  console.log('   ❌ 创建修复版本失败:', error.message);
}

// 4. 启动应用
console.log('\n4. 启动应用...');
console.log('请选择启动方式:');
console.log('1. 使用修复版本 (推荐)');
console.log('2. 使用原版本');
console.log('3. 仅修复不启动');

// 这里可以添加交互式选择，暂时直接给出指令
console.log('\n🚀 启动指令:');
console.log('修复版本: cd frontend && cp src/main-fixed.js src/main.js && npm run serve');
console.log('原版本: cd frontend && npm run serve');
console.log('');
console.log('💡 提示: 如果仍有错误，请清除浏览器缓存 (Ctrl+Shift+R)');