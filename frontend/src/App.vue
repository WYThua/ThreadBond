<template>
  <div id="app">
    <!-- 全局加载状态 -->
    <van-loading v-if="$store.state.app.globalLoading" type="spinner" color="#1989fa" class="global-loading">
      加载中...
    </van-loading>

    <!-- 主要内容区域 -->
    <div class="app-container" :class="{ 'has-tabbar': showTabbar }">
      <router-view />
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar v-if="showTabbar" v-model="activeTab" @change="onTabChange" ref="tabbar" fixed :placeholder="false"
      safe-area-inset-bottom class="custom-tabbar">
      <van-tabbar-item icon="home-o" to="/home">
        首页
      </van-tabbar-item>
      <van-tabbar-item icon="search" to="/discover">
        发现
      </van-tabbar-item>
      <van-tabbar-item to="/create" class="create-tab">
        <template #icon>
          <span class="create-icon">➕</span>
        </template>
      </van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/chat">
        聊天
      </van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">
        我的
      </van-tabbar-item>
    </van-tabbar>

    <!-- 全局通知 -->
    <van-notify v-model="showNotify" :type="notifyType" :message="notifyMessage" :duration="3000" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'App',

  data() {
    return {
      activeTab: 0,
      showNotify: false,
      notifyType: 'primary',
      notifyMessage: ''
    };
  },

  computed: {
    ...mapState('app', ['globalLoading']),

    // 判断是否显示底部导航栏
    showTabbar() {
      const hideTabbarRoutes = ['/login', '/register', '/welcome'];
      return !hideTabbarRoutes.includes(this.$route.path);
    }
  },

  watch: {
    // 监听路由变化，更新活跃标签
    '$route'(to, from) {
      // 防止重复处理相同路由
      if (to.path !== from.path) {
        this.updateActiveTab(to.path);
      }
    }
  },

  created() {
    // 防止重复初始化
    if (this.$root._isAppInitialized) {
      return;
    }
    this.$root._isAppInitialized = true;

    // 初始化应用
    this.initApp();

    // 监听全局事件
    this.setupGlobalListeners();
  },

  mounted() {
    // 组件挂载后设置当前页面的高亮状态
    this.updateActiveTab(this.$route.path);
  },

  methods: {
    // 初始化应用
    async initApp() {
      try {
        // 检查用户登录状态
        if (this.$store.hasModule('auth')) {
          await this.$store.dispatch('auth/checkAuthStatus');
        }

        // 初始化 Socket 连接（如果已登录）
        if (this.$store.state.auth && this.$store.state.auth.isAuthenticated) {
          if (this.$store.hasModule('socket')) {
            await this.$store.dispatch('socket/connect');
          }
        }

        // 设置主题
        this.setupTheme();

      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    },

    // 设置全局监听器
    setupGlobalListeners() {
      // 监听网络状态
      window.addEventListener('online', this.onNetworkOnline);
      window.addEventListener('offline', this.onNetworkOffline);

      // 监听页面可见性变化
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      // 监听应用安装提示
      window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    },

    // 设置主题
    setupTheme() {
      // 检查系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('threadbond-theme');

      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      if (this.$store.hasModule('app')) {
        this.$store.commit('app/SET_THEME', theme);
      }

      // 应用主题到 HTML 根元素
      document.documentElement.setAttribute('data-theme', theme);
    },

    // 更新活跃标签
    updateActiveTab(path) {
      let index = -1;

      // 精确匹配路由
      if (path === '/home' || path === '/') {
        index = 0;
      } else if (path.startsWith('/discover')) {
        index = 1;
      } else if (path.startsWith('/create')) {
        index = 2;
      } else if (path.startsWith('/chat')) {
        index = 3;
      } else if (path.startsWith('/profile')) {
        index = 4;
      }

      if (index !== -1 && index !== this.activeTab) {
        this.activeTab = index;
        console.log('更新活跃标签:', path, '-> 索引:', index);
      }
    },

    // 标签切换处理
    onTabChange(index) {
      const routes = ['/home', '/discover', '/create', '/chat', '/profile'];
      const targetRoute = routes[index];

      // 防止重复导航到当前路由
      if (targetRoute && this.$route.path !== targetRoute) {
        this.$router.push(targetRoute).catch(err => {
          // 忽略重复导航错误
          if (err.name !== 'NavigationDuplicated') {
            console.error('路由导航错误:', err);
          }
        });
      }
    },

    // 网络连接恢复
    onNetworkOnline() {
      this.$notify({
        type: 'success',
        message: '网络连接已恢复'
      });

      // 重新连接 Socket
      if (this.$store.state.auth && this.$store.state.auth.isAuthenticated && this.$store.hasModule('socket')) {
        this.$store.dispatch('socket/reconnect');
      }
    },

    // 网络连接断开
    onNetworkOffline() {
      this.$notify({
        type: 'warning',
        message: '网络连接已断开'
      });
    },

    // 页面可见性变化
    onVisibilityChange() {
      if (document.hidden) {
        // 页面隐藏时的处理
        if (this.$store.hasModule('app')) {
          this.$store.commit('app/SET_APP_VISIBLE', false);
        }
      } else {
        // 页面显示时的处理
        if (this.$store.hasModule('app')) {
          this.$store.commit('app/SET_APP_VISIBLE', true);
        }

        // 刷新数据
        if (this.$store.state.auth && this.$store.state.auth.isAuthenticated && this.$store.hasModule('chat')) {
          this.$store.dispatch('chat/refreshUnreadCount');
        }
      }
    },

    // PWA 安装提示
    onBeforeInstallPrompt(event) {
      // 阻止默认的安装提示
      event.preventDefault();

      // 保存事件，稍后可以手动触发
      if (this.$store.hasModule('app')) {
        this.$store.commit('app/SET_INSTALL_PROMPT', event);
      }
    }
  },

  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('online', this.onNetworkOnline);
    window.removeEventListener('offline', this.onNetworkOffline);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
  }
};
</script>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-color);
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;

  &.has-tabbar {
    padding-bottom: 60px;
    /* 适配新的导航栏高度 */
  }
}

.global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
}

// 全局样式变量
:root {
  --primary-color: #1989fa;
  --success-color: #07c160;
  --warning-color: #ff976a;
  --danger-color: #ee0a24;
  --background-color: #f7f8fa;
  --text-color: #323233;
  --text-color-2: #646566;
  --text-color-3: #969799;
  --border-color: #ebedf0;
  --active-color: #f2f3f5;
}

// 暗色主题
[data-theme="dark"] {
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --text-color-2: #cccccc;
  --text-color-3: #999999;
  --border-color: #333333;
  --active-color: #2a2a2a;
}

// 安全区域适配
.safe-area-inset-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

// 自定义底部导航栏样式
.custom-tabbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.08) !important;
  height: 60px !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-around !important;

  // 暗色主题适配
  [data-theme="dark"] & {
    background: rgba(26, 26, 26, 0.95) !important;
    border-top-color: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.3) !important;
  }

  .van-tabbar-item {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 6px 4px 4px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-height: 50px !important;

    // 图标样式
    .van-icon {
      font-size: 22px !important;
      transition: all 0.3s ease;
      margin-bottom: 2px !important;
      display: block !important;
    }

    // 文字样式
    .van-tabbar-item__text {
      font-size: 13px !important;
      line-height: 1.2 !important;
      transition: all 0.3s ease;
      font-weight: 500;
      margin-top: 2px !important;
      text-align: center !important;
      display: block !important;
    }

    // 默认状态
    .van-icon {
      color: var(--text-color-3) !important;
    }

    .van-tabbar-item__text {
      color: var(--text-color-3) !important;
    }

    // 选中状态
    &.van-tabbar-item--active {
      .van-icon {
        color: var(--primary-color) !important;
      }

      .van-tabbar-item__text {
        color: var(--primary-color) !important;
        font-weight: 600;
      }
    }

    // 创建按钮特殊样式
    &.create-tab {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      .create-icon {
        font-size: 28px !important;
        color: var(--text-color-3) !important;
        transition: all 0.3s ease;
        margin: 0 !important;
        display: block !important;
      }

      &.van-tabbar-item--active {
        .create-icon {
          color: var(--primary-color) !important;
        }
      }
    }
  }

  // 添加底部安全区域
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

// 为整个应用添加更好的过渡效果
.app-container {
  transition: padding-bottom 0.3s ease;
}
</style>