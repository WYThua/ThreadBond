<template>
  <div class="register-page">
    <van-nav-bar
      title="注册"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div class="register-content">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <van-icon name="chat-o" size="60" color="#1989fa" />
        <h2>加入 ThreadBond</h2>
        <p>创建您的匿名社交账号</p>
      </div>

      <!-- 注册表单 -->
      <van-form @submit="handleRegister" class="register-form">
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
          placeholder="请输入密码（至少8位，包含大小写字母、数字和特殊字符）"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少8位' },
            { validator: validatePassword }
          ]"
          left-icon="lock"
          clearable
        />

        <van-field
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validateConfirmPassword }
          ]"
          left-icon="lock"
          clearable
        />

        <!-- 密码强度指示器 -->
        <div class="password-strength" v-if="form.password">
          <div class="strength-label">密码强度：</div>
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="passwordStrengthClass"
              :style="{ width: passwordStrengthWidth }"
            ></div>
          </div>
          <div class="strength-text" :class="passwordStrengthClass">
            {{ passwordStrengthText }}
          </div>
        </div>

        <!-- 服务条款 -->
        <div class="terms-section">
          <van-checkbox v-model="form.agreeTerms" :rules="[{ required: true, message: '请同意服务条款' }]">
            我已阅读并同意
            <span class="terms-link" @click="showTerms">《服务条款》</span>
            和
            <span class="terms-link" @click="showPrivacy">《隐私政策》</span>
          </van-checkbox>
        </div>

        <van-button
          type="primary"
          size="large"
          block
          native-type="submit"
          :loading="isRegistering"
          :disabled="!canSubmit"
          class="register-button"
        >
          注册
        </van-button>
      </van-form>

      <!-- 登录链接 -->
      <div class="login-link">
        <span>已有账号？</span>
        <span class="link" @click="goToLogin">立即登录</span>
      </div>
    </div>

    <!-- 服务条款弹窗 -->
    <van-popup
      v-model="showTermsPopup"
      position="center"
      round
      closeable
      class="terms-popup"
    >
      <div class="popup-content">
        <h3>服务条款</h3>
        <div class="terms-content">
          <p>1. 用户应遵守相关法律法规，不得发布违法违规内容。</p>
          <p>2. 平台保护用户隐私，采用匿名机制保障用户信息安全。</p>
          <p>3. 用户应文明使用平台，不得恶意骚扰他人。</p>
          <p>4. 平台有权对违规行为进行处理。</p>
          <p>5. 最终解释权归 ThreadBond 所有。</p>
        </div>
        <van-button type="primary" size="small" @click="showTermsPopup = false">
          我知道了
        </van-button>
      </div>
    </van-popup>

    <!-- 隐私政策弹窗 -->
    <van-popup
      v-model="showPrivacyPopup"
      position="center"
      round
      closeable
      class="privacy-popup"
    >
      <div class="popup-content">
        <h3>隐私政策</h3>
        <div class="privacy-content">
          <p>1. 我们仅收集必要的用户信息（邮箱用于验证）。</p>
          <p>2. 用户的真实身份信息不会被存储或泄露。</p>
          <p>3. 聊天内容采用端到端加密保护。</p>
          <p>4. 用户可随时删除自己的数据。</p>
          <p>5. 我们不会将用户信息用于商业用途。</p>
        </div>
        <van-button type="primary" size="small" @click="showPrivacyPopup = false">
          我知道了
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Register',

  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      showTermsPopup: false,
      showPrivacyPopup: false
    };
  },

  computed: {
    ...mapGetters('auth', ['isRegistering']),

    // 是否可以提交
    canSubmit() {
      return this.form.email && 
             this.form.password && 
             this.form.confirmPassword && 
             this.form.agreeTerms &&
             this.form.password === this.form.confirmPassword &&
             this.passwordStrength >= 4; // 要求密码强度至少为"很强"
    },

    // 密码强度
    passwordStrength() {
      const password = this.form.password;
      if (!password) return 0;

      let strength = 0;
      
      // 长度检查
      if (password.length >= 8) strength += 1;
      
      // 复杂度检查
      if (/[a-z]/.test(password)) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;

      return Math.min(strength, 4);
    },

    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength <= 1) return 'weak';
      if (strength <= 2) return 'medium';
      if (strength <= 3) return 'strong';
      return 'very-strong';
    },

    passwordStrengthWidth() {
      return (this.passwordStrength / 4) * 100 + '%';
    },

    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength <= 1) return '弱';
      if (strength <= 2) return '中等';
      if (strength <= 3) return '强';
      return '很强';
    }
  },

  methods: {
    ...mapActions('auth', ['register']),

    // 验证密码
    validatePassword(value) {
      if (value.length < 8) {
        return '密码至少8位';
      }
      
      // 检查是否包含大写字母
      if (!/[A-Z]/.test(value)) {
        return '密码必须包含大写字母';
      }
      
      // 检查是否包含小写字母
      if (!/[a-z]/.test(value)) {
        return '密码必须包含小写字母';
      }
      
      // 检查是否包含数字
      if (!/\d/.test(value)) {
        return '密码必须包含数字';
      }
      
      // 检查是否包含特殊字符
      if (!/[@$!%*?&]/.test(value)) {
        return '密码必须包含特殊字符(@$!%*?&)';
      }
      
      return true;
    },

    // 验证确认密码
    validateConfirmPassword(value) {
      if (value !== this.form.password) {
        return '两次输入的密码不一致';
      }
      return true;
    },

    // 处理注册
    async handleRegister() {
      try {
        const result = await this.register({
          email: this.form.email,
          password: this.form.password
        });

        if (result.success) {
          this.$toast.success('注册成功！');
          // 注册成功后直接跳转到首页（因为已经自动登录）
          this.$router.push('/home');
        } else {
          this.$toast.fail(result.message || '注册失败');
        }
      } catch (error) {
        console.error('注册错误:', error);
        this.$toast.fail('注册失败，请重试');
      }
    },

    // 前往登录页
    goToLogin() {
      this.$router.push('/login');
    },

    // 显示服务条款
    showTerms() {
      this.showTermsPopup = true;
    },

    // 显示隐私政策
    showPrivacy() {
      this.showPrivacyPopup = true;
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
.register-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.register-content {
  padding: 20px;
}

.logo-section {
  text-align: center;
  padding: 30px 0;

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

.register-form {
  margin-bottom: 30px;

  .van-field {
    margin-bottom: 16px;
  }

  .password-strength {
    display: flex;
    align-items: center;
    margin: 8px 0 16px;
    font-size: 12px;

    .strength-label {
      color: #646566;
      margin-right: 8px;
      white-space: nowrap;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background-color: #ebedf0;
      border-radius: 2px;
      overflow: hidden;
      margin-right: 8px;

      .strength-fill {
        height: 100%;
        transition: all 0.3s;

        &.weak {
          background-color: #ee0a24;
        }

        &.medium {
          background-color: #ff976a;
        }

        &.strong {
          background-color: #ffd21e;
        }

        &.very-strong {
          background-color: #07c160;
        }
      }
    }

    .strength-text {
      white-space: nowrap;

      &.weak {
        color: #ee0a24;
      }

      &.medium {
        color: #ff976a;
      }

      &.strong {
        color: #ffd21e;
      }

      &.very-strong {
        color: #07c160;
      }
    }
  }

  .terms-section {
    margin: 20px 0;
    font-size: 14px;

    .terms-link {
      color: #1989fa;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .register-button {
    margin-top: 20px;
    border-radius: 25px;
    height: 50px;
    font-size: 16px;

    &:disabled {
      opacity: 0.5;
    }
  }
}

.login-link {
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

.terms-popup,
.privacy-popup {
  .popup-content {
    padding: 30px 20px;
    max-width: 300px;

    h3 {
      margin: 0 0 16px;
      color: #323233;
      font-size: 18px;
      text-align: center;
    }

    .terms-content,
    .privacy-content {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 20px;

      p {
        margin: 8px 0;
        color: #646566;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .van-button {
      width: 100%;
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .register-content {
    padding: 16px;
  }

  .logo-section {
    padding: 20px 0;

    h2 {
      font-size: 22px;
    }
  }
}
</style>