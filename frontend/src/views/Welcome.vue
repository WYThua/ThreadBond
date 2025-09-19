<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <!-- Logo 和标题 -->
      <div class="logo-section">
        <div class="logo">
          <van-icon name="chat-o" size="80" color="#1989fa" />
        </div>
        <h1 class="app-title">ThreadBond</h1>
        <p class="app-subtitle">匿名线索社交</p>
      </div>

      <!-- 功能介绍 -->
      <div class="features">
        <div class="feature-item">
          <van-icon name="search" size="24" color="#1989fa" />
          <span>解密线索</span>
        </div>
        <div class="feature-item">
          <van-icon name="chat-o" size="24" color="#1989fa" />
          <span>匿名聊天</span>
        </div>
        <div class="feature-item">
          <van-icon name="shield-o" size="24" color="#1989fa" />
          <span>隐私保护</span>
        </div>
      </div>

      <!-- 描述文字 -->
      <div class="description">
        <p>通过解密线索开启匿名聊天</p>
        <p>在保护隐私的同时体验深度社交</p>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="action-buttons">
      <van-button 
        type="primary" 
        size="large" 
        block 
        @click="goToLogin"
        :loading="loading"
      >
        立即开始
      </van-button>
      
      <div class="login-links">
        <span @click="goToLogin" class="link">已有账号？登录</span>
        <span class="divider">|</span>
        <span @click="goToRegister" class="link">注册新账号</span>
      </div>
    </div>

    <!-- PWA 安装提示 -->
    <div v-if="canInstallPWA" class="install-prompt">
      <van-notice-bar
        left-icon="info-o"
        text="点击安装到桌面，获得更好的使用体验"
        mode="closeable"
        @click="installPWA"
        @close="dismissInstallPrompt"
      />
    </div>
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
    ...mapGetters('app', ['canInstallPWA'])
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
  justify-content: space-between;
  padding: 40px 20px 20px;
  color: white;
}

.welcome-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.logo-section {
  margin-bottom: 60px;

  .logo {
    margin-bottom: 20px;
  }

  .app-title {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
    color: white;
  }

  .app-subtitle {
    font-size: 16px;
    opacity: 0.8;
    margin: 0;
  }
}

.features {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 300px;
  margin-bottom: 40px;

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    span {
      font-size: 12px;
      opacity: 0.9;
    }
  }
}

.description {
  opacity: 0.9;
  line-height: 1.6;

  p {
    margin: 4px 0;
    font-size: 14px;
  }
}

.action-buttons {
  .van-button {
    margin-bottom: 20px;
    border-radius: 25px;
    height: 50px;
    font-size: 16px;
    font-weight: 500;
  }

  .login-links {
    text-align: center;
    font-size: 14px;
    opacity: 0.8;

    .link {
      cursor: pointer;
      text-decoration: underline;
      
      &:hover {
        opacity: 1;
      }
    }

    .divider {
      margin: 0 12px;
    }
  }
}

.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

// 响应式适配
@media (max-height: 600px) {
  .welcome-page {
    padding: 20px;
  }

  .logo-section {
    margin-bottom: 30px;

    .app-title {
      font-size: 28px;
    }
  }

  .features {
    margin-bottom: 20px;
  }
}
</style>