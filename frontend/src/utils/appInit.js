// 应用初始化工具
let isInitialized = false;
let initPromise = null;

export function initializeApp() {
  // 防止重复初始化
  if (isInitialized) {
    return Promise.resolve();
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = new Promise((resolve) => {
    console.log('🚀 开始初始化应用...');
    
    // 设置初始化标志
    isInitialized = true;
    
    // 防止重复加载的全局标志
    window.__THREADBOND_INITIALIZED__ = true;
    
    resolve();
  });
  
  return initPromise;
}

export function isAppInitialized() {
  return isInitialized || window.__THREADBOND_INITIALIZED__;
}