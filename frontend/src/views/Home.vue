<template>
  <div class="home-page">
    <!-- 加载状态 -->
    <div v-if="isInitializing" class="loading-container">
      <div class="loading-animation">
        <div class="loading-circle"></div>
        <div class="loading-circle"></div>
        <div class="loading-circle"></div>
      </div>
      <p class="loading-text">正在初始化...</p>
    </div>

    <!-- 主要内容 -->
    <div v-else class="main-content">
      <!-- 顶部状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <div class="time-display">{{ currentTime }}</div>
        </div>
        <div class="status-right">
          <div class="signal-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
          <div class="battery-icon">
            <div class="battery-level"></div>
          </div>
        </div>
      </div>

      <!-- 主导航栏 -->
      <div class="main-header">
        <div class="header-content">
          <div class="user-section">
            <div class="avatar-container">
              <div class="avatar-ring"></div>
              <div class="avatar-inner">
                <div class="avatar-icon"></div>
              </div>
              <div class="online-indicator"></div>
            </div>
            <div class="user-info">
              <h2 class="user-name">{{ anonymousName }}</h2>
              <p class="user-status">
                <span class="status-dot"></span>
                匿名模式
              </p>
            </div>
          </div>
          <div class="header-actions">
            <div class="action-btn notification-btn" @click="showNotifications">
              <div class="notification-icon"></div>
              <div class="notification-badge">2</div>
            </div>
            <div class="action-btn search-btn" @click="showSearch">
              <div class="search-icon"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 滚动内容 -->
      <div class="scroll-content">
        <!-- 欢迎卡片 -->
        <div class="hero-section">
          <div class="hero-background">
            <div class="hero-pattern"></div>
            <div class="hero-gradient"></div>
          </div>
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">探索神秘世界</h1>
              <p class="hero-subtitle">在 ThreadBond 开启您的匿名社交冒险</p>
            </div>
            <div class="hero-action">
              <button class="explore-button" @click="startExploring">
                <span class="button-icon"></span>
                <span class="button-text">开始探索</span>
                <div class="button-ripple"></div>
              </button>
            </div>
          </div>
          <div class="hero-decoration">
            <div class="floating-element element-1"></div>
            <div class="floating-element element-2"></div>
            <div class="floating-element element-3"></div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <div class="section-header">
            <h3 class="section-title">快速操作</h3>
            <div class="section-line"></div>
          </div>

          <div class="actions-grid">
            <div class="action-card primary-card" @click="goToCreate">
              <div class="card-background"></div>
              <div class="card-content">
                <div class="card-icon">
                  <div class="create-icon"></div>
                </div>
                <div class="card-info">
                  <h4 class="card-title">创建线索</h4>
                  <p class="card-desc">设计神秘谜题</p>
                </div>
                <div class="card-arrow"></div>
              </div>
              <div class="card-glow"></div>
            </div>

            <div class="action-card secondary-card" @click="goToDiscover">
              <div class="card-background"></div>
              <div class="card-content">
                <div class="card-icon">
                  <div class="discover-icon"></div>
                </div>
                <div class="card-info">
                  <h4 class="card-title">发现线索</h4>
                  <p class="card-desc">解密他人谜题</p>
                </div>
                <div class="card-arrow"></div>
              </div>
              <div class="card-glow"></div>
            </div>
          </div>
        </div>

        <!-- 动态时间线 -->
        <div class="timeline-section">
          <div class="section-header">
            <h3 class="section-title">最近动态</h3>
            <span class="view-all" @click="viewAllActivities">查看全部</span>
          </div>

          <div class="timeline-container">
            <div class="timeline-item">
              <div class="timeline-dot success"></div>
              <div class="timeline-line"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4 class="timeline-title">欢迎加入 ThreadBond</h4>
                  <span class="timeline-time">刚刚</span>
                </div>
                <p class="timeline-desc">您的匿名身份已激活，开始探索神秘世界吧！</p>
                <div class="timeline-tags">
                  <span class="tag welcome">欢迎</span>
                </div>
              </div>
            </div>

            <div class="timeline-item">
              <div class="timeline-dot info"></div>
              <div class="timeline-line"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4 class="timeline-title">安全系统已启用</h4>
                  <span class="timeline-time">2分钟前</span>
                </div>
                <p class="timeline-desc">端到端加密已开启，您的隐私得到完全保护</p>
                <div class="timeline-tags">
                  <span class="tag security">安全</span>
                </div>
              </div>
            </div>

            <div class="timeline-item">
              <div class="timeline-dot warning"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4 class="timeline-title">系统提示</h4>
                  <span class="timeline-time">5分钟前</span>
                </div>
                <p class="timeline-desc">建议完善您的匿名档案以获得更好的体验</p>
                <div class="timeline-tags">
                  <span class="tag tip">提示</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统状态仪表板 -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">系统状态</h3>
            <div class="status-indicator online">
              <div class="status-pulse"></div>
              <span class="status-text">运行正常</span>
            </div>
          </div>

          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="dashboard-icon backend"></div>
              <div class="dashboard-info">
                <span class="dashboard-label">后端服务</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 98%"></div>
                </div>
                <span class="dashboard-value">98%</span>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="dashboard-icon database"></div>
              <div class="dashboard-info">
                <span class="dashboard-label">数据库</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 95%"></div>
                </div>
                <span class="dashboard-value">95%</span>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="dashboard-icon realtime"></div>
              <div class="dashboard-info">
                <span class="dashboard-label">实时通信</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <span class="dashboard-value">100%</span>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="dashboard-icon security"></div>
              <div class="dashboard-info">
                <span class="dashboard-label">安全系统</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <span class="dashboard-value">100%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部间距 -->
        <div class="bottom-spacer"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Home',

  data() {
    return {
      isInitializing: true,
      currentTime: '',
      timeInterval: null
    };
  },

  computed: {
    ...mapGetters('user', ['currentAnonymousIdentity', 'userInfo']),
    ...mapGetters('auth', ['isAuthenticated']),

    anonymousName() {
      // 防御性编程：确保有默认值
      if (this.currentAnonymousIdentity && this.currentAnonymousIdentity.displayName) {
        return this.currentAnonymousIdentity.displayName;
      }
      return '神秘旅行者';
    },

    // 检查是否已完全初始化
    isFullyLoaded() {
      return this.isAuthenticated && !this.isInitializing;
    }
  },

  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    },

    startExploring() {
      this.$router.push('/discover').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('路由跳转错误:', err);
        }
      });
    },

    goToCreate() {
      this.$router.push('/create').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('路由跳转错误:', err);
        }
      });
    },

    goToDiscover() {
      this.$router.push('/discover').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('路由跳转错误:', err);
        }
      });
    },

    goToChat() {
      this.$router.push('/chat').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('路由跳转错误:', err);
        }
      });
    },

    goToProfile() {
      this.$router.push('/profile').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('路由跳转错误:', err);
        }
      });
    },

    showNotifications() {
      this.$toast('通知功能开发中...');
    },

    showSearch() {
      this.$toast('搜索功能开发中...');
    },

    showStats() {
      this.$toast('统计功能开发中...');
    },

    viewAllActivities() {
      this.$toast('查看全部动态功能开发中...');
    },



    // 初始化用户数据
    async initializeUserData() {
      try {
        console.log('🏠 Home 页面初始化用户数据...');

        // 如果没有匿名身份，尝试生成一个
        if (!this.currentAnonymousIdentity) {
          console.log('🎭 没有匿名身份，生成默认身份...');

          // 创建默认匿名身份
          const defaultIdentity = {
            id: 'anon_' + Date.now(),
            displayName: '神秘旅行者',
            avatar: null,
            createdAt: new Date().toISOString()
          };

          // 设置到 store
          this.$store.commit('user/SET_ANONYMOUS_IDENTITY', defaultIdentity);
          console.log('✅ 默认匿名身份已设置:', defaultIdentity);
        }

        this.isInitializing = false;
        console.log('✅ Home 页面初始化完成');

      } catch (error) {
        console.error('❌ Home 页面初始化失败:', error);
        this.isInitializing = false;
      }
    }
  },

  async mounted() {
    console.log('🏠 首页已加载 - ThreadBond 匿名社交平台');
    console.log('🔍 当前认证状态:', this.isAuthenticated);
    console.log('👤 当前用户信息:', this.userInfo);
    console.log('🎭 当前匿名身份:', this.currentAnonymousIdentity);

    // 初始化时间显示
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);

    // 初始化用户数据
    await this.initializeUserData();
  },

  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },

  // 监听认证状态变化
  watch: {
    isAuthenticated: {
      handler(newVal) {
        console.log('🔄 认证状态变化:', newVal);
        if (newVal && this.isInitializing) {
          this.initializeUserData();
        }
      },
      immediate: true
    },

    currentAnonymousIdentity: {
      handler(newVal) {
        console.log('🎭 匿名身份变化:', newVal);
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
// 全局变量
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  --success-color: #4facfe;
  --warning-color: #ffeaa7;
  --danger-color: #fd79a8;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}

.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;
  z-index: 2;

  .loading-animation {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;

    .loading-circle {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      animation: loadingBounce 1.4s ease-in-out infinite both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }

      &:nth-child(3) {
        animation-delay: 0s;
      }
    }
  }

  .loading-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
}

@keyframes loadingBounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 主要内容
.main-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
}

// 状态栏
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  .status-left {
    .time-display {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 600;
    }
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .signal-bars {
      display: flex;
      align-items: flex-end;
      gap: 2px;

      .bar {
        width: 3px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 1px;

        &:nth-child(1) {
          height: 4px;
        }

        &:nth-child(2) {
          height: 6px;
        }

        &:nth-child(3) {
          height: 8px;
        }

        &:nth-child(4) {
          height: 10px;
        }
      }
    }

    .battery-icon {
      width: 20px;
      height: 10px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 2px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        right: -3px;
        top: 2px;
        width: 2px;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 0 1px 1px 0;
      }

      .battery-level {
        width: 80%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 1px;
      }
    }
  }
}

// 主导航栏
.main-header {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar-container {
      position: relative;
      width: 56px;
      height: 56px;

      .avatar-ring {
        position: absolute;
        inset: 0;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        animation: avatarPulse 2s ease-in-out infinite;
      }

      .avatar-inner {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);

        .avatar-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            background: var(--primary-color);
            border-radius: 50%;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 6px;
            background: var(--primary-color);
            border-radius: 6px 6px 0 0;
          }
        }
      }

      .online-indicator {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 12px;
        height: 12px;
        background: var(--success-color);
        border: 2px solid rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        animation: onlinePulse 1.5s ease-in-out infinite;
      }
    }

    .user-info {
      .user-name {
        color: rgba(255, 255, 255, 0.95);
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 4px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .user-status {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin: 0;

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--success-color);
          border-radius: 50%;
          animation: statusBlink 2s ease-in-out infinite;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;

    .action-btn {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      backdrop-filter: blur(10px);

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }

      &.notification-btn {
        .notification-icon {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 10px;
            background: var(--primary-color);
            border-radius: 6px 6px 0 0;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 2px;
          }
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: var(--danger-color);
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.9);
        }
      }

      &.search-btn {
        .search-icon {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: -6px;
            right: -6px;
            width: 8px;
            height: 2px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 1px;
            transform: rotate(45deg);
          }
        }
      }
    }
  }
}

.custom-nav {
  background: white;
  padding: 12px 20px;
  border-bottom: 1px solid #ebedf0;
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-left {
    display: flex;
    align-items: center;

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1989fa 0%, #1976d2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .user-info {
      .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin: 0 0 2px;
      }

      .user-status {
        font-size: 12px;
        color: #07c160;
        margin: 0;
      }
    }
  }

  .nav-right {
    width: 36px;
    height: 36px;
    background: #f7f8fa;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:active {
      background: #ebedf0;
    }
  }
}

.home-content {
  padding: 0 20px 20px;
}

.welcome-banner {
  margin: 20px 0 24px;

  .banner-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 24px;
    position: relative;
    overflow: hidden;
    color: white;

    .banner-content {
      position: relative;
      z-index: 2;

      .banner-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 8px;
      }

      .banner-subtitle {
        font-size: 14px;
        opacity: 0.9;
        margin: 0 0 16px;
        line-height: 1.4;
      }

      .explore-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        backdrop-filter: blur(10px);
      }
    }

    .banner-decoration {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;

  .feature-card {
    background: white;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;

      &.create {
        background: linear-gradient(135deg, #1989fa 0%, #1976d2 100%);
      }

      &.discover {
        background: linear-gradient(135deg, #07c160 0%, #4caf50 100%);
      }

      &.chat {
        background: linear-gradient(135deg, #ff976a 0%, #ffa726 100%);
      }

      &.profile {
        background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
      }
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 4px;
    }

    .card-desc {
      font-size: 12px;
      color: #969799;
      margin: 0;
    }
  }
}

.recent-section,
.system-status {
  margin-bottom: 24px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin: 0;
    }

    .section-more {
      font-size: 12px;
      color: #1989fa;
      cursor: pointer;
    }
  }
}

.activity-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;

  .activity-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      background: #f7f8fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;

      .activity-title {
        font-size: 14px;
        color: #323233;
        margin: 0 0 4px;
      }

      .activity-time {
        font-size: 12px;
        color: #969799;
        margin: 0;
      }
    }
  }
}

.status-grid {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;

    .status-text {
      font-size: 12px;
      color: #646566;
      margin-top: 8px;
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .home-content {
    padding: 0 16px 16px;
  }

  .custom-nav {
    padding: 12px 16px;
  }

  .feature-grid {
    gap: 8px;

    .feature-card {
      padding: 16px 12px;

      .card-icon {
        width: 40px;
        height: 40px;
      }
    }
  }
}

// 滚动内容区域
.scroll-content {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.95) 20%, #ffffff 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  margin-top: 20px;
  padding: 24px 20px 0;
  min-height: calc(100vh - 200px);
}

// Hero 区域
.hero-section {
  position: relative;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  margin-bottom: 32px;
  overflow: hidden;

  .hero-background {
    position: absolute;
    inset: 0;

    .hero-pattern {
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
      opacity: 0.3;
    }

    .hero-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hero-text {
    flex: 1;

    .hero-title {
      color: white;
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      line-height: 1.2;
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0 0 24px;
      line-height: 1.4;
    }
  }

  .hero-action {
    .explore-button {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }

      .button-icon {
        width: 16px;
        height: 16px;
        background: currentColor;
        border-radius: 50%;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          border-left: 6px solid white;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        }
      }

      .button-ripple {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        transform: scale(0);
        transition: transform 0.6s ease;
      }

      &:active .button-ripple {
        transform: scale(1);
      }
    }
  }

  .hero-decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .floating-element {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;

      &.element-1 {
        width: 60px;
        height: 60px;
        top: 20%;
        right: 10%;
        animation-delay: 0s;
      }

      &.element-2 {
        width: 40px;
        height: 40px;
        top: 60%;
        right: 20%;
        animation-delay: 2s;
      }

      &.element-3 {
        width: 80px;
        height: 80px;
        top: 10%;
        right: 30%;
        animation-delay: 4s;
      }
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  33% {
    transform: translateY(-10px) rotate(120deg);
  }

  66% {
    transform: translateY(5px) rotate(240deg);
  }
}

// 快速操作区域
.quick-actions {
  margin-bottom: 32px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .section-title {
      color: var(--text-primary);
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .section-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color) 0%, transparent 100%);
      border-radius: 1px;
    }
  }

  .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    .action-card {
      position: relative;
      border-radius: var(--radius-lg);
      padding: 24px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      min-height: 160px;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
      }

      &:active {
        transform: translateY(-2px);
      }

      .card-background {
        position: absolute;
        inset: 0;
        border-radius: inherit;
      }

      .card-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
        min-height: 120px;
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);

        .create-icon {
          width: 24px;
          height: 24px;
          position: relative;

          &::before,
          &::after {
            content: '';
            position: absolute;
            background: white;
            border-radius: 1px;
          }

          &::before {
            width: 20px;
            height: 2px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          &::after {
            width: 2px;
            height: 20px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        .discover-icon {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-radius: 50%;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: -6px;
            right: -6px;
            width: 8px;
            height: 2px;
            background: white;
            border-radius: 1px;
            transform: rotate(45deg);
          }
        }
      }

      .card-info {
        .card-title {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .card-desc {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin: 0;
        }
      }

      .card-arrow {
        width: 20px;
        height: 20px;
        position: relative;
        margin-left: auto;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          border-left: 8px solid rgba(255, 255, 255, 0.8);
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
        }
      }

      .card-glow {
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .card-glow {
        opacity: 1;
      }

      &.primary-card {
        .card-background {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
        }
      }

      &.secondary-card {
        .card-background {
          background: linear-gradient(135deg, #4facfe 0%, #00d4aa 100%);
          background: linear-gradient(135deg, var(--success-color, #4facfe) 0%, #00d4aa 100%);
        }
      }
    }
  }

  .secondary-actions {
    display: flex;
    gap: 12px;

    .secondary-card {
      flex: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        border-color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &:active {
        transform: translateY(0);
      }

      .secondary-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &.chat-icon {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);

          &::before {
            content: '';
            width: 18px;
            height: 12px;
            background: white;
            border-radius: 6px;
            position: relative;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 6px;
            left: 8px;
            width: 0;
            height: 0;
            border-left: 4px solid white;
            border-top: 3px solid transparent;
            border-bottom: 3px solid transparent;
          }
        }

        &.profile-icon {
          background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);

          &::before {
            content: '';
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 6px;
          }

          &::after {
            content: '';
            width: 14px;
            height: 8px;
            background: white;
            border-radius: 7px 7px 0 0;
            position: absolute;
            bottom: 4px;
          }
        }

        &.stats-icon {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);

          &::before {
            content: '';
            width: 16px;
            height: 12px;
            background: white;
            border-radius: 2px;
            position: relative;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 2px;
            background: var(--primary-color);
            border-radius: 1px;
            box-shadow: 0 -3px 0 var(--primary-color), 0 -6px 0 var(--primary-color);
          }
        }
      }

      .secondary-text {
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 500;
        text-align: center;
      }

      .secondary-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        background: var(--danger-color);
        color: white;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      }
    }
  }
}

// 动画关键帧
@keyframes avatarPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes onlinePulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

@keyframes statusBlink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

// 时间线区域
.timeline-section {
  margin-bottom: 32px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .section-title {
      color: var(--text-primary);
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .view-all {
      color: var(--primary-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: var(--secondary-color);
      }
    }
  }

  .timeline-container {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 1px solid var(--border-color);
  }

  .timeline-item {
    position: relative;
    padding-left: 32px;
    padding-bottom: 24px;

    &:last-child {
      padding-bottom: 0;

      .timeline-line {
        display: none;
      }
    }

    .timeline-dot {
      position: absolute;
      left: 0;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      z-index: 2;

      &.success {
        background: var(--success-color);
      }

      &.info {
        background: var(--primary-color);
      }

      &.warning {
        background: var(--warning-color);
      }
    }

    .timeline-line {
      position: absolute;
      left: 5px;
      top: 16px;
      width: 2px;
      height: calc(100% - 12px);
      background: var(--border-color);
    }

    .timeline-content {
      .timeline-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .timeline-title {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .timeline-time {
          color: var(--text-secondary);
          font-size: 12px;
        }
      }

      .timeline-desc {
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 12px;
      }

      .timeline-tags {
        display: flex;
        gap: 8px;

        .tag {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;

          &.welcome {
            background: rgba(79, 172, 254, 0.1);
            color: var(--success-color);
          }

          &.security {
            background: rgba(102, 126, 234, 0.1);
            color: var(--primary-color);
          }

          &.tip {
            background: rgba(255, 234, 167, 0.3);
            color: #d68910;
          }
        }
      }
    }
  }
}

// 仪表板区域
.dashboard-section {
  margin-bottom: 32px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .section-title {
      color: var(--text-primary);
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(79, 172, 254, 0.1);
      border-radius: 20px;

      &.online {
        .status-pulse {
          width: 8px;
          height: 8px;
          background: var(--success-color);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-text {
          color: var(--success-color);
          font-size: 12px;
          font-weight: 600;
        }
      }
    }
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    .dashboard-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-sm);
      }

      .dashboard-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &.backend {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

          &::before {
            content: '';
            width: 20px;
            height: 16px;
            background: white;
            border-radius: 2px;
            position: relative;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 2px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 1px;
          }
        }

        &.database {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

          &::before {
            content: '';
            width: 18px;
            height: 4px;
            background: white;
            border-radius: 2px;
            position: absolute;
            top: 8px;
          }

          &::after {
            content: '';
            width: 18px;
            height: 12px;
            border: 2px solid white;
            border-top: none;
            border-radius: 0 0 9px 9px;
            position: absolute;
            bottom: 8px;
          }
        }

        &.realtime {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);

          &::before {
            content: '';
            width: 16px;
            height: 16px;
            border: 2px solid white;
            border-radius: 50%;
            position: relative;
          }

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
          }
        }

        &.security {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

          &::before {
            content: '';
            width: 14px;
            height: 16px;
            border: 2px solid white;
            border-top: 6px solid white;
            border-radius: 7px 7px 2px 2px;
            position: relative;
          }

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
          }
        }
      }

      .dashboard-info {
        flex: 1;

        .dashboard-label {
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          display: block;
          margin-bottom: 6px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color) 0%, var(--success-color) 100%);
            border-radius: 2px;
            transition: width 0.3s ease;
          }
        }

        .dashboard-value {
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 600;
        }
      }
    }
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

// 底部间距
.bottom-spacer {
  height: 80px;
}

// 响应式设计
@media (max-width: 768px) {
  .hero-section {
    padding: 24px 20px;

    .hero-content {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }

    .hero-text .hero-title {
      font-size: 24px;
    }
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .secondary-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 16px;
  }

  .scroll-content {
    padding: 20px 16px 0;
  }

  .hero-section {
    padding: 20px 16px;
    margin-bottom: 24px;
  }

  .quick-actions,
  .timeline-section,
  .dashboard-section {
    margin-bottom: 24px;
  }


}
</style>