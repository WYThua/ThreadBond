<template>
  <div class="login-page">
    <van-nav-bar
      title="登录"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div class="login-content">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <van-icon name="chat-o" size="60" color="#1989fa" />
        <h2>欢迎回来</h2>
        <p>登录您的 ThreadBond 账号</p>
      </div>

      <!-- 登录表单 -->
      <van-form @submit="handleLogin" class="login-form">
        <van-field
          v-model="form.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          :rules="[
            { required: true, message: '请输入邮箱地址' },
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
          ]"
          left-icon="envelop-o"
          clearable
        />

        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' }
          ]"
          left-icon="lock"
          clearable
        />

        <div class="form-options">
          <van-checkbox v-model="form.rememberMe">记住我</van-checkbox>
          <span class="forgot-password" @click="showForgotPassword">忘记密码？</span>
        </div>

        <van-button
          type="primary"
          size="large"
          block
          native-type="submit"
          :loading="isLoggingIn"
          class="login-button"
        >
          登录
        </van-button>
      </van-form>

      <!-- 其他登录方式 -->
      <div class="other-login">
        <div class="divider">
          <span>或</span>
        </div>
        
        <!-- 这里可以添加第三方登录 -->
        <div class="social-login">
          <p class="social-login-text">暂不支持第三方登录</p>
        </div>
      </div>

      <!-- 注册链接 -->
      <div class="register-link">
        <span>还没有账号？</span>
        <span class="link" @click="goToRegister">立即注册</span>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <van-popup
      v-model="showForgotPasswordPopup"
      position="center"
      round
      closeable
      class="forgot-password-popup"
    >
      <div class="popup-content">
        <h3>找回密码</h3>
        <p>请联系客服找回密码</p>
        <van-button type="primary" size="small" @click="showForgotPasswordPopup = false">
          知道了
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Login',

  data() {
    return {
      form: {
        email: '',
        password: '',
        rememberMe: false
      },
      showForgotPasswordPopup: false
    };
  },

  computed: {
    ...mapGetters('auth', ['isLoggingIn'])
  },

  methods: {
    ...mapActions('auth', ['login']),

    // 处理登录
    async handleLogin() {
      try {
        const result = await this.login({
          email: this.form.email,
          password: this.form.password
        });

        if (result.success) {
          this.$toast.success('登录成功');
          
          // 获取重定向地址
          const redirect = this.$route.query.redirect || '/home';
          this.$router.replace(redirect);
        } else {
          this.$toast.fail(result.message || '登录失败');
        }
      } catch (error) {
        console.error('登录错误:', error);
        this.$toast.fail('登录失败，请重试');
      }
    },

    // 前往注册页
    goToRegister() {
      this.$router.push('/register');
    },

    // 显示忘记密码
    showForgotPassword() {
      this.showForgotPasswordPopup = true;
    }
  },

  mounted() {
    // 如果已登录，重定向到首页
    if (this.$store.state.auth.isAuthenticated) {
      this.$router.replace('/home');
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-content {
  padding: 20px;
}

.logo-section {
  text-align: center;
  padding: 40px 0;

  h2 {
    margin: 16px 0 8px;
    color: #323233;
    font-size: 24px;
    font-weight: 500;
  }

  p {
    color: #969799;
    font-size: 14px;
    margin: 0;
  }
}

.login-form {
  margin-bottom: 30px;

  .van-field {
    margin-bottom: 16px;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
    font-size: 14px;

    .forgot-password {
      color: #1989fa;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-button {
    margin-top: 20px;
    border-radius: 25px;
    height: 50px;
    font-size: 16px;
  }
}

.other-login {
  margin: 30px 0;

  .divider {
    text-align: center;
    position: relative;
    margin: 20px 0;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #ebedf0;
    }

    span {
      background-color: #f7f8fa;
      padding: 0 16px;
      color: #969799;
      font-size: 14px;
    }
  }

  .social-login {
    text-align: center;

    .social-login-text {
      color: #969799;
      font-size: 14px;
      margin: 20px 0;
    }
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #646566;

  .link {
    color: #1989fa;
    cursor: pointer;
    margin-left: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.forgot-password-popup {
  .popup-content {
    padding: 30px 20px;
    text-align: center;

    h3 {
      margin: 0 0 16px;
      color: #323233;
      font-size: 18px;
    }

    p {
      margin: 0 0 20px;
      color: #646566;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .login-content {
    padding: 16px;
  }

  .logo-section {
    padding: 30px 0;

    h2 {
      font-size: 22px;
    }
  }
}
</style>