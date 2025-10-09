// 应用全局状态管理
const state = {
  // 全局加载状态
  globalLoading: false,
  
  // 当前主题
  theme: 'light',
  
  // 应用是否可见
  appVisible: true,
  
  // 当前路由
  currentRoute: null,
  
  // PWA 安装提示事件
  installPrompt: null,
  
  // 网络状态
  networkStatus: navigator.onLine,
  
  // 设备信息
  deviceInfo: {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isWechat: /MicroMessenger/i.test(navigator.userAgent)
  },
  
  // 应用配置
  config: {
    apiBaseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
    socketUrl: process.env.VUE_APP_SOCKET_URL || 'http://localhost:3000',
    uploadMaxSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedAudioTypes: ['audio/mp3', 'audio/wav', 'audio/ogg']
  }
};

const mutations = {
  // 设置全局加载状态
  SET_GLOBAL_LOADING(state, loading) {
    state.globalLoading = loading;
  },
  
  // 设置主题
  SET_THEME(state, theme) {
    state.theme = theme;
  },
  
  // 设置应用可见性
  SET_APP_VISIBLE(state, visible) {
    state.appVisible = visible;
  },
  
  // 设置当前路由
  SET_CURRENT_ROUTE(state, route) {
    state.currentRoute = route;
  },
  
  // 别名 mutation，兼容错误的调用
  setCurrentRoute(state, route) {
    console.warn('使用了已废弃的 mutation 名称 setCurrentRoute，请使用 SET_CURRENT_ROUTE');
    state.currentRoute = route;
  },
  
  // 设置 PWA 安装提示
  SET_INSTALL_PROMPT(state, prompt) {
    state.installPrompt = prompt;
  },
  
  // 设置网络状态
  SET_NETWORK_STATUS(state, status) {
    state.networkStatus = status;
  },
  
  // 更新配置
  UPDATE_CONFIG(state, config) {
    state.config = { ...state.config, ...config };
  }
};

const actions = {
  // 显示全局加载
  showGlobalLoading({ commit }) {
    commit('SET_GLOBAL_LOADING', true);
  },
  
  // 隐藏全局加载
  hideGlobalLoading({ commit }) {
    commit('SET_GLOBAL_LOADING', false);
  },
  
  // 切换主题
  toggleTheme({ commit, state }) {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    commit('SET_THEME', newTheme);
    
    // 应用到 DOM
    document.documentElement.setAttribute('data-theme', newTheme);
  },
  
  // 设置主题
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
  
  // 触发 PWA 安装
  async triggerPWAInstall({ state, commit }) {
    if (state.installPrompt) {
      try {
        // 显示安装提示
        state.installPrompt.prompt();
        
        // 等待用户选择
        const { outcome } = await state.installPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('用户接受了 PWA 安装');
        } else {
          console.log('用户拒绝了 PWA 安装');
        }
        
        // 清除提示事件
        commit('SET_INSTALL_PROMPT', null);
        
        return outcome === 'accepted';
      } catch (error) {
        console.error('PWA 安装失败:', error);
        return false;
      }
    }
    return false;
  },
  
  // 检查应用更新
  async checkAppUpdate() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('检查应用更新失败:', error);
      }
    }
  },
  
  // 初始化应用配置
  async initAppConfig({ commit }) {
    try {
      // 可以从服务器获取配置
      // const config = await api.getAppConfig();
      // commit('UPDATE_CONFIG', config);
      
      // 暂时使用默认配置
      console.log('应用配置初始化完成');
    } catch (error) {
      console.error('应用配置初始化失败:', error);
    }
  }
};

const getters = {
  // 是否为移动设备
  isMobile: state => state.deviceInfo.isMobile,
  
  // 是否为 iOS 设备
  isIOS: state => state.deviceInfo.isIOS,
  
  // 是否为 Android 设备
  isAndroid: state => state.deviceInfo.isAndroid,
  
  // 是否在微信中
  isWechat: state => state.deviceInfo.isWechat,
  
  // 是否为暗色主题
  isDarkTheme: state => state.theme === 'dark',
  
  // 是否可以安装 PWA
  canInstallPWA: state => !!state.installPrompt,
  
  // API 基础 URL
  apiBaseUrl: state => state.config.apiBaseUrl,
  
  // Socket URL
  socketUrl: state => state.config.socketUrl
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};