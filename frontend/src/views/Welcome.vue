<template>
  <div class="welcome-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="welcome-content">
      <!-- Logo 和标题 -->
      <div class="logo-section">
        <div class="logo-container">
          <div class="logo-bg">
            <van-icon name="chat-o" size="48" color="#ffffff" />
          </div>
        </div>
        <h1 class="app-title">ThreadBond</h1>
        <p class="app-subtitle">匿名线索社交平台</p>
      </div>

      <!-- 功能卡片 -->
      <div class="feature-cards">
        <div class="feature-card">
          <div class="feature-icon">
            <van-icon name="search" size="20" color="#1989fa" />
          </div>
          <div class="feature-text">
            <h4>解密线索</h4>
            <p>挑战有趣的谜题</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <van-icon name="chat-o" size="20" color="#07c160" />
          </div>
          <div class="feature-text">
            <h4>匿名聊天</h4>
            <p>保护隐私的社交</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <van-icon name="shield-o" size="20" color="#ff976a" />
          </div>
          <div class="feature-text">
            <h4>安全保护</h4>
            <p>端到端加密通信</p>
          </div>
        </div>
      </div>

      <!-- 描述文字 -->
      <div class="description">
        <p class="main-desc">通过解密线索开启匿名聊天</p>
        <p class="sub-desc">在保护隐私的同时体验深度社交连接</p>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="action-section">
      <van-button 
        type="primary" 
        size="large" 
        block 
        round
        @click="goToRegister"
        :loading="loading"
        class="primary-btn"
      >
        开始体验
      </van-button>
      
      <van-button 
        type="default" 
        size="large" 
        block 
        round
        @click="goToLogin"
        class="secondary-btn"
      >
        已有账号登录
      </van-button>
    </div>

    <!-- PWA 安装提示 -->
    <van-popup v-model="showInstallPrompt" position="bottom" round>
      <div class="install-content">
        <div class="install-header">
          <van-icon name="info-o" size="24" color="#1989fa" />
          <h3>安装应用</h3>
        </div>
        <p>将 ThreadBond 添加到主屏幕，获得更好的使用体验</p>
        <div class="install-actions">
          <van-button size="small" @click="dismissInstallPrompt">稍后</van-button>
          <van-button type="primary" size="small" @click="installPWA">安装</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Welcome',
  
  data() {
    return {
      loading: false
    };
  },

  computed: {
    ...mapGetters('app', ['canInstallPWA']),
    
    // 安全的 getter，避免 undefined 错误
    showInstallPrompt() {
      return false; // 暂时禁用 PWA 安装提示
    }
  },

  methods: {
    ...mapActions('app', ['triggerPWAInstall']),

    // 前往登录页
    goToLogin() {
      this.$router.push('/login');
    },

    // 前往注册页
    goToRegister() {
      this.$router.push('/register');
    },

    // 安装 PWA
    async installPWA() {
      const result = await this.triggerPWAInstall();
      if (result) {
        this.$toast.success('安装成功！');
      }
    },

    // 忽略安装提示
    dismissInstallPrompt() {
      // 可以在这里记录用户忽略了安装提示
      console.log('用户忽略了 PWA 安装提示');
    }
  },

  mounted() {
    // 如果用户已登录，直接跳转到首页
    if (this.$store.state.auth.isAuthenticated) {
      this.$router.replace('/home');
    }
  }
};
</script>

<style lang="scss" scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    
    &.circle-1 {
      width: 200px;
      height: 200px;
      top: -100px;
      right: -100px;
    }
    
    &.circle-2 {
      width: 150px;
      height: 150px;
      bottom: 20%;
      left: -75px;
    }
    
    &.circle-3 {
      width: 100px;
      height: 100px;
      top: 30%;
      left: 20px;
    }
  }
}

.welcome-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 24px 40px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 48px;

  .logo-container {
    margin-bottom: 24px;
    
    .logo-bg {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }

  .app-title {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
    color: white;
    letter-spacing: -0.5px;
  }

  .app-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 400;
  }
}

.feature-cards {
  margin-bottom: 40px;

  .feature-card {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 12px;
    text-align: left;

    .feature-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .feature-text {
      flex: 1;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: white;
        margin: 0 0 4px;
      }

      p {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }
  }
}

.description {
  margin-bottom: 20px;

  .main-desc {
    font-size: 18px;
    font-weight: 500;
    color: white;
    margin: 0 0 8px;
    line-height: 1.4;
  }

  .sub-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.5;
  }
}

.action-section {
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;

  .primary-btn {
    margin-bottom: 12px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
  }

  .secondary-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.9);
    color: #323233;
    border: none;
  }
}

.install-content {
  padding: 24px;
  text-align: center;

  .install-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    h3 {
      margin: 0 0 0 8px;
      font-size: 18px;
      color: #323233;
    }
  }

  p {
    color: #646566;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .install-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

// 响应式适配
@media (max-height: 700px) {
  .welcome-content {
    padding: 40px 24px 20px;
  }

  .logo-section {
    margin-bottom: 32px;

    .app-title {
      font-size: 32px;
    }
  }

  .feature-cards {
    margin-bottom: 24px;
  }
}

@media (max-width: 375px) {
  .welcome-content {
    padding: 40px 20px 20px;
  }

  .action-section {
    padding: 20px;
  }
}
</style>