<template>
  <div class="register-page">
    <van-nav-bar
      title="创建账号"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      fixed
      placeholder
    />

    <div class="register-content">
      <!-- 头部区域 -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-bg">
            <van-icon name="user-circle-o" size="32" color="#1989fa" />
          </div>
        </div>
        <h2 class="page-title">加入 ThreadBond</h2>
        <p class="page-subtitle">创建您的匿名社交账号，开启神秘之旅</p>
      </div>

      <!-- 注册表单 -->
      <div class="form-container">
        <van-form @submit="handleRegister" class="register-form">
          <div class="form-section">
            <h3 class="section-title">账号信息</h3>
            
            <van-field
              v-model="form.email"
              name="email"
              placeholder="请输入邮箱地址"
              :rules="[
                { required: true, message: '请输入邮箱地址' },
                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
              ]"
              left-icon="envelop-o"
              clearable
              :border="false"
              class="custom-field"
            />

            <van-field
              v-model="form.password"
              type="password"
              name="password"
              placeholder="设置登录密码"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
                { validator: validatePassword }
              ]"
              left-icon="lock"
              clearable
              :border="false"
              class="custom-field"
            />

            <van-field
              v-model="form.confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="再次确认密码"
              :rules="[
                { required: true, message: '请确认密码' },
                { validator: validateConfirmPassword }
              ]"
              left-icon="lock"
              clearable
              :border="false"
              class="custom-field"
            />

            <!-- 密码强度指示器 -->
            <div class="password-strength" v-if="form.password">
              <div class="strength-header">
                <span class="strength-label">密码强度</span>
                <span class="strength-text" :class="passwordStrengthClass">
                  {{ passwordStrengthText }}
                </span>
              </div>
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrengthWidth }"
                ></div>
              </div>
              <div class="strength-tips">
                <van-icon name="info-o" size="12" color="#969799" />
                <span>密码至少6位，建议包含字母、数字和特殊字符以提高安全性</span>
              </div>
            </div>
          </div>

          <!-- 服务条款 -->
          <div class="terms-section">
            <van-checkbox 
              v-model="form.agreeTerms" 
              :rules="[{ required: true, message: '请同意服务条款' }]"
              icon-size="16px"
            >
              <span class="terms-text">
                我已阅读并同意
                <span class="terms-link" @click="showTerms">《服务条款》</span>
                和
                <span class="terms-link" @click="showPrivacy">《隐私政策》</span>
              </span>
            </van-checkbox>
          </div>

          <van-button
            type="primary"
            size="large"
            block
            round
            native-type="submit"
            :loading="isRegistering"
            :disabled="!canSubmit"
            class="register-button"
          >
            {{ isRegistering ? '创建中...' : '创建账号' }}
          </van-button>
        </van-form>

        <!-- 登录链接 -->
        <div class="login-link">
          <span class="login-text">已有账号？</span>
          <van-button 
            type="default" 
            size="small" 
            plain 
            @click="goToLogin"
            class="login-btn"
          >
            立即登录
          </van-button>
        </div>
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
        <div class="popup-header">
          <van-icon name="description" size="24" color="#1989fa" />
          <h3>服务条款</h3>
        </div>
        <div class="terms-content">
          <div class="term-item">
            <h4>1. 用户行为规范</h4>
            <p>用户应遵守相关法律法规，不得发布违法违规内容，维护良好的社区环境。</p>
          </div>
          <div class="term-item">
            <h4>2. 隐私保护</h4>
            <p>平台采用匿名机制保障用户信息安全，保护用户隐私不被泄露。</p>
          </div>
          <div class="term-item">
            <h4>3. 文明使用</h4>
            <p>用户应文明使用平台功能，不得恶意骚扰他人或进行不当行为。</p>
          </div>
          <div class="term-item">
            <h4>4. 平台权利</h4>
            <p>平台有权对违规行为进行处理，包括但不限于警告、限制或封禁账号。</p>
          </div>
        </div>
        <van-button type="primary" block round @click="showTermsPopup = false">
          我已了解
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
        <div class="popup-header">
          <van-icon name="shield-o" size="24" color="#07c160" />
          <h3>隐私政策</h3>
        </div>
        <div class="privacy-content">
          <div class="privacy-item">
            <h4>信息收集</h4>
            <p>我们仅收集必要的用户信息（邮箱用于验证），不会收集其他个人敏感信息。</p>
          </div>
          <div class="privacy-item">
            <h4>身份保护</h4>
            <p>用户的真实身份信息不会被存储或泄露，所有社交活动均为匿名进行。</p>
          </div>
          <div class="privacy-item">
            <h4>通信加密</h4>
            <p>聊天内容采用端到端加密保护，确保通信内容的私密性和安全性。</p>
          </div>
          <div class="privacy-item">
            <h4>数据控制</h4>
            <p>用户可随时删除自己的数据，我们不会将用户信息用于商业用途。</p>
          </div>
        </div>
        <van-button type="primary" block round @click="showPrivacyPopup = false">
          我已了解
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
             this.form.password.length >= 6; // 只要密码长度大于等于6位即可
    },

    // 密码强度
    passwordStrength() {
      const password = this.form.password;
      if (!password) return 0;

      let strength = 0;
      
      // 基础长度检查
      if (password.length >= 6) strength += 1;
      if (password.length >= 8) strength += 1;
      
      // 复杂度检查（可选加分项）
      if (/[a-z]/.test(password)) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;

      return Math.min(strength, 5);
    },

    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength <= 1) return 'weak';
      if (strength <= 2) return 'medium';
      if (strength <= 3) return 'strong';
      if (strength <= 4) return 'very-strong';
      return 'excellent';
    },

    passwordStrengthWidth() {
      return (this.passwordStrength / 5) * 100 + '%';
    },

    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength <= 1) return '弱';
      if (strength <= 2) return '中等';
      if (strength <= 3) return '强';
      if (strength <= 4) return '很强';
      return '极强';
    }
  },

  methods: {
    ...mapActions('auth', ['register']),

    // 验证密码
    validatePassword(value) {
      if (value.length < 6) {
        return '密码至少6位';
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
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
}

.register-content {
  padding: 0 20px 20px;
}

.header-section {
  text-align: center;
  padding: 32px 0 40px;

  .logo-container {
    margin-bottom: 20px;
    
    .logo-bg {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #1989fa 0%, #1976d2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
    }
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #323233;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    font-size: 15px;
    color: #646566;
    margin: 0;
    line-height: 1.4;
  }
}

.form-container {
  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px;
      padding-left: 4px;
    }
  }

  .custom-field {
    background: white;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #f0f0f0;
    
    &:focus-within {
      border-color: #1989fa;
      box-shadow: 0 2px 8px rgba(25, 137, 250, 0.15);
    }

    :deep(.van-field__control) {
      font-size: 16px;
      padding: 16px;
    }

    :deep(.van-field__left-icon) {
      margin-right: 12px;
      color: #969799;
    }
  }

  .password-strength {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin: 12px 0 24px;
    border: 1px solid #f0f0f0;

    .strength-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .strength-label {
        font-size: 14px;
        color: #646566;
        font-weight: 500;
      }

      .strength-text {
        font-size: 12px;
        font-weight: 600;

        &.weak { color: #ee0a24; }
        &.medium { color: #ff976a; }
        &.strong { color: #ffd21e; }
        &.very-strong { color: #07c160; }
        &.excellent { color: #1989fa; }
      }
    }

    .strength-bar {
      height: 6px;
      background-color: #f5f5f5;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;

      .strength-fill {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 3px;

        &.weak { background: linear-gradient(90deg, #ee0a24 0%, #ff4757 100%); }
        &.medium { background: linear-gradient(90deg, #ff976a 0%, #ffa726 100%); }
        &.strong { background: linear-gradient(90deg, #ffd21e 0%, #ffeb3b 100%); }
        &.very-strong { background: linear-gradient(90deg, #07c160 0%, #4caf50 100%); }
        &.excellent { background: linear-gradient(90deg, #1989fa 0%, #2196f3 100%); }
      }
    }

    .strength-tips {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #969799;

      span {
        margin-left: 4px;
      }
    }
  }

  .terms-section {
    margin: 24px 0;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #ebedf0;

    .terms-text {
      font-size: 13px;
      color: #646566;
      line-height: 1.5;
    }

    .terms-link {
      color: #1989fa;
      font-weight: 500;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .register-button {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    margin: 24px 0;
    box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);

    &:disabled {
      opacity: 0.6;
      box-shadow: none;
    }
  }

  .login-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;

    .login-text {
      font-size: 14px;
      color: #646566;
    }

    .login-btn {
      font-size: 14px;
      height: 32px;
      padding: 0 16px;
    }
  }
}

.popup-content {
  padding: 24px;
  max-width: 340px;
  max-height: 70vh;
  overflow-y: auto;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    h3 {
      margin: 0 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: #323233;
    }
  }

  .terms-content,
  .privacy-content {
    margin-bottom: 24px;

    .term-item,
    .privacy-item {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        margin: 0 0 8px;
      }

      p {
        font-size: 13px;
        color: #646566;
        line-height: 1.5;
        margin: 0;
      }
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .register-content {
    padding: 0 16px 16px;
  }

  .header-section {
    padding: 24px 0 32px;

    .page-title {
      font-size: 24px;
    }
  }

  .popup-content {
    padding: 20px;
    max-width: 300px;
  }
}
</style>