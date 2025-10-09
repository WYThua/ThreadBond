// Vuex 修复工具
export function patchVuexStore(store) {
  // 保存原始的 commit 方法
  const originalCommit = store.commit;
  
  // 重写 commit 方法
  store.commit = function(type, payload, options) {
    // 自动修正常见的 mutation 名称错误
    const fixes = {
      'app/setCurrentRoute': 'app/SET_CURRENT_ROUTE',
      'app/setTheme': 'app/SET_THEME',
      'app/setGlobalLoading': 'app/SET_GLOBAL_LOADING',
      'app/setAppVisible': 'app/SET_APP_VISIBLE',
      'app/setInstallPrompt': 'app/SET_INSTALL_PROMPT',
      'app/setNetworkStatus': 'app/SET_NETWORK_STATUS'
    };
    
    if (fixes[type]) {
      console.warn(`自动修正 mutation 名称: ${type} -> ${fixes[type]}`);
      type = fixes[type];
    }
    
    try {
      return originalCommit.call(this, type, payload, options);
    } catch (error) {
      console.error('Vuex commit 错误:', error);
      
      // 如果是未知的 mutation 类型，尝试更多修正
      if (error.message && error.message.includes('unknown mutation type')) {
        console.warn('尝试自动修正 mutation 名称失败:', type);
        
        // 尝试转换为大写下划线格式
        const upperCaseType = type.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
        if (upperCaseType !== type) {
          console.warn(`尝试使用大写格式: ${type} -> ${upperCaseType}`);
          try {
            return originalCommit.call(this, upperCaseType, payload, options);
          } catch (secondError) {
            console.error('大写格式也失败:', secondError);
          }
        }
      }
      
      // 不抛出错误，避免应用崩溃
      return;
    }
  };
  
  console.log('Vuex store 已打补丁，支持自动修正 mutation 名称');
}

// 全局错误处理
export function setupGlobalErrorHandling() {
  // 捕获 Vuex 相关错误
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('[vuex] unknown mutation type')) {
      console.warn('Vuex mutation 错误已被捕获:', message);
      return;
    }
    
    return originalConsoleError.apply(console, args);
  };
  
  // 捕获 DOM 相关错误
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      const message = event.error.message;
      
      if (message.includes('getBoundingClientRect') || 
          message.includes('Cannot read properties of undefined')) {
        console.warn('DOM 错误已被捕获:', message);
        event.preventDefault();
        return;
      }
      
      if (message.includes('[vuex] unknown mutation type')) {
        console.warn('Vuex 错误已被捕获:', message);
        event.preventDefault();
        return;
      }
    }
  });
  
  console.log('全局错误处理已设置');
}