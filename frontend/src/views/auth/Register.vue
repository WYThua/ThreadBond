<template>
  <div class="register-page">
    <div class="register-content">
      <!-- Logo section -->
      <div class="logo-section">
        <h2>Join ThreadBond</h2>
        <p>Create your anonymous social account</p>
      </div>

      <!-- Register form -->
      <van-form @submit="handleRegister" class="register-form">
        <div class="field-group">
          <label class="field-label">Email</label>
          <van-field v-model="form.email" name="email" placeholder="Enter your email address" left-icon="envelop-o"
            clearable :border="false" class="custom-field" @blur="validateEmail" @input="clearEmailError" />
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>
        </div>

        <div class="field-group">
          <label class="field-label">Verification Code</label>
          <div class="verification-field">
            <van-field v-model="form.verificationCode" name="verificationCode" placeholder="Enter verification code"
              left-icon="shield-o" clearable :border="false" class="custom-field verification-input"
              @blur="validateVerificationCode" @input="clearVerificationCodeError" />
            <van-button :loading="isSendingCode" :disabled="!canSendCode" @click="sendVerificationCode"
              class="send-code-button" size="small">
              {{ codeButtonText }}
            </van-button>
          </div>
          <div v-if="errors.verificationCode" class="field-error">{{ errors.verificationCode }}</div>
        </div>

        <div class="field-group">
          <label class="field-label">Password</label>
          <div class="password-input-wrapper">
            <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
              placeholder="Create a password" left-icon="lock" :border="false" class="custom-field password-field"
              @blur="validatePassword" @input="clearPasswordError" />
            <div class="password-toggle-icon" @click="togglePasswordVisibility">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="!showPassword"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path v-if="!showPassword" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor"
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path v-if="showPassword"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </div>

        <div class="field-group">
          <label class="field-label">Confirm Password</label>
          <div class="password-input-wrapper">
            <van-field v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
              name="confirmPassword" placeholder="Confirm your password" left-icon="lock" :border="false"
              class="custom-field password-field" @blur="validateConfirmPassword" @input="clearConfirmPasswordError" />
            <div class="password-toggle-icon" @click="toggleConfirmPasswordVisibility">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="!showConfirmPassword"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path v-if="!showConfirmPassword" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor"
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path v-if="showConfirmPassword"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</div>
        </div>

        <!-- Password strength indicator -->
        <div class="password-strength" v-if="form.password">
          <div class="strength-header">
            <span class="strength-label">Password Strength</span>
            <span class="strength-text" :class="passwordStrengthClass">
              {{ passwordStrengthText }}
            </span>
          </div>
          <div class="strength-bar">
            <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
          </div>
          <div class="strength-tips">
            <span>At least 6 characters. Include letters, numbers and symbols for better security.</span>
          </div>
        </div>

        <!-- Terms agreement -->
        <div class="form-options">
          <van-checkbox v-model="form.agreeTerms">
            <span class="terms-text">
              I agree to the
              <span class="terms-link" @click="showTerms">Terms of Service</span>
              and
              <span class="terms-link" @click="showPrivacy">Privacy Policy</span>
            </span>
          </van-checkbox>
        </div>

        <div class="button-container">
          <van-button type="primary" :loading="isRegistering" :disabled="!canSubmit" class="register-button"
            @click="handleRegister">
            {{ isRegistering ? 'Creating Account...' : 'Create Account' }}
          </van-button>
        </div>
      </van-form>

      <!-- Login link -->
      <div class="login-link">
        <span>Already have an account?</span>
        <span class="link" @click="goToLogin">Sign In</span>
      </div>
    </div>

    <!-- Terms of Service popup with overlay -->
    <div v-if="showTermsPopup" class="popup-overlay" @click="closeTermsPopup">
      <van-popup v-model="showTermsPopup" position="center" round closeable class="terms-popup" :z-index="9999"
        :overlay="false" lock-scroll @click.stop>
        <div class="popup-content">
          <div class="popup-header">
            <van-icon name="description" size="24" color="#1989fa" />
            <h3>Terms of Service</h3>
          </div>
          <div class="terms-content">
            <div class="term-item">
              <h4>1. User Conduct</h4>
              <p>Users must comply with applicable laws and regulations, refrain from posting illegal content, and
                maintain a positive community environment.</p>
            </div>
            <div class="term-item">
              <h4>2. Privacy Protection</h4>
              <p>The platform uses anonymous mechanisms to protect user information security and prevent privacy leaks.
              </p>
            </div>
            <div class="term-item">
              <h4>3. Respectful Use</h4>
              <p>Users should use platform features respectfully, without malicious harassment or inappropriate
                behavior.</p>
            </div>
            <div class="term-item">
              <h4>4. Platform Rights</h4>
              <p>The platform reserves the right to address violations, including warnings, restrictions, or account
                suspension.</p>
            </div>
          </div>
          <van-button type="primary" block round @click="closeTermsPopup">
            I Understand
          </van-button>
        </div>
      </van-popup>
    </div>

    <!-- Privacy Policy popup with overlay -->
    <div v-if="showPrivacyPopup" class="popup-overlay" @click="closePrivacyPopup">
      <van-popup v-model="showPrivacyPopup" position="center" round closeable class="privacy-popup" :z-index="9999"
        :overlay="false" lock-scroll @click.stop>
        <div class="popup-content">
          <div class="popup-header">
            <van-icon name="shield-o" size="24" color="#07c160" />
            <h3>Privacy Policy</h3>
          </div>
          <div class="privacy-content">
            <div class="privacy-item">
              <h4>Information Collection</h4>
              <p>We only collect necessary user information (email for verification) and do not collect other personal
                sensitive information.</p>
            </div>
            <div class="privacy-item">
              <h4>Identity Protection</h4>
              <p>User identity information is not stored or disclosed. All social activities are conducted anonymously.
              </p>
            </div>
            <div class="privacy-item">
              <h4>Communication Encryption</h4>
              <p>Chat content is protected with end-to-end encryption to ensure privacy and security of communications.
              </p>
            </div>
            <div class="privacy-item">
              <h4>Data Control</h4>
              <p>Users can delete their data at any time. We do not use user information for commercial purposes.</p>
            </div>
          </div>
          <van-button type="primary" block round @click="closePrivacyPopup">
            I Understand
          </van-button>
        </div>
      </van-popup>
    </div>
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
        verificationCode: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      showTermsPopup: false,
      showPrivacyPopup: false,
      errors: {
        email: '',
        verificationCode: '',
        password: '',
        confirmPassword: ''
      },
      isSendingCode: false,
      codeCountdown: 0,
      codeTimer: null,
      showPassword: false,
      showConfirmPassword: false
    };
  },

  computed: {
    ...mapGetters('auth', ['isRegistering']),

    // Can submit form
    canSubmit() {
      return this.form.email &&
        this.form.verificationCode &&
        this.form.password &&
        this.form.confirmPassword &&
        this.form.agreeTerms &&
        this.form.password === this.form.confirmPassword &&
        this.form.password.length >= 6 &&
        !this.errors.email &&
        !this.errors.verificationCode &&
        !this.errors.password &&
        !this.errors.confirmPassword;
    },

    // Can send verification code
    canSendCode() {
      return this.form.email &&
        !this.errors.email &&
        this.codeCountdown === 0 &&
        !this.isSendingCode;
    },

    // Code button text
    codeButtonText() {
      if (this.isSendingCode) {
        return 'Sending...';
      } else if (this.codeCountdown > 0) {
        return `${this.codeCountdown}s`;
      } else {
        return 'Send Code';
      }
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
      if (strength <= 1) return 'Weak';
      if (strength <= 2) return 'Fair';
      if (strength <= 3) return 'Good';
      if (strength <= 4) return 'Strong';
      return 'Excellent';
    }
  },

  methods: {
    ...mapActions('auth', ['register']),

    // Validate email field
    validateEmail() {
      if (!this.form.email) {
        this.errors.email = 'Please enter your email address';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'Invalid email format';
      } else {
        this.errors.email = '';
      }
    },

    // Validate password field
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = 'Please enter a password';
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters';
      } else {
        this.errors.password = '';
      }
    },

    // Validate verification code field
    validateVerificationCode() {
      if (!this.form.verificationCode) {
        this.errors.verificationCode = 'Please enter verification code';
      } else if (!/^\d{6}$/.test(this.form.verificationCode)) {
        this.errors.verificationCode = 'Verification code must be 6 digits';
      } else {
        this.errors.verificationCode = '';
      }
    },

    // Validate confirm password field
    validateConfirmPassword() {
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password';
      } else if (this.form.confirmPassword !== this.form.password) {
        this.errors.confirmPassword = 'Passwords do not match';
      } else {
        this.errors.confirmPassword = '';
      }
    },

    // Clear email error when user starts typing
    clearEmailError() {
      if (this.errors.email && this.form.email) {
        this.errors.email = '';
      }
    },

    // Clear verification code error when user starts typing
    clearVerificationCodeError() {
      if (this.errors.verificationCode && this.form.verificationCode) {
        this.errors.verificationCode = '';
      }
    },

    // Clear password error when user starts typing
    clearPasswordError() {
      if (this.errors.password && this.form.password) {
        this.errors.password = '';
      }
    },

    // Clear confirm password error when user starts typing
    clearConfirmPasswordError() {
      if (this.errors.confirmPassword && this.form.confirmPassword) {
        this.errors.confirmPassword = '';
      }
    },

    // Send verification code
    async sendVerificationCode() {
      // Validate email first
      this.validateEmail();
      if (this.errors.email) {
        return;
      }

      this.isSendingCode = true;

      try {
        // Import API instance
        const api = (await import('@/api/index.js')).default;

        // Call API to send verification code
        const response = await api.post('/auth/send-verification-code', {
          email: this.form.email
        });

        this.$toast.success('Verification code sent successfully');
        this.startCountdown();
      } catch (error) {
        console.error('Send verification code error:', error);
        // Error is already handled by the API interceptor
      } finally {
        this.isSendingCode = false;
      }
    },

    // Start countdown timer
    startCountdown() {
      this.codeCountdown = 60;
      this.codeTimer = setInterval(() => {
        this.codeCountdown--;
        if (this.codeCountdown <= 0) {
          clearInterval(this.codeTimer);
          this.codeTimer = null;
        }
      }, 1000);
    },

    // Validate entire form
    validateForm() {
      this.validateEmail();
      this.validateVerificationCode();
      this.validatePassword();
      this.validateConfirmPassword();

      return !this.errors.email &&
        !this.errors.verificationCode &&
        !this.errors.password &&
        !this.errors.confirmPassword &&
        this.form.agreeTerms;
    },

    // Handle registration
    async handleRegister(event) {
      // 阻止默认的表单提交行为
      if (event) {
        event.preventDefault();
      }
      console.log('🚀 Register button clicked, starting registration process...');
      console.log('📊 Form data:', this.form);
      console.log('📊 Errors:', this.errors);
      console.log('📊 Can submit:', this.canSubmit);

      // Clear previous errors
      this.errors = { email: '', verificationCode: '', password: '', confirmPassword: '' };

      // Validate form
      if (!this.validateForm()) {
        console.log('❌ Form validation failed');
        console.log('📊 Validation errors:', this.errors);
        return;
      }

      console.log('✅ Form validation passed, calling register API...');

      try {
        const result = await this.register({
          email: this.form.email,
          verificationCode: this.form.verificationCode,
          password: this.form.password
        });

        if (result.success) {
          console.log('✅ Registration successful');
          // Registration successful, redirect to home
          const redirect = this.$route.query.redirect || '/home';
          this.$router.replace(redirect);
        } else {
          console.log('❌ Registration failed:', result.message);
          // Handle registration failure - the error should already be user-friendly from the API
        }
      } catch (error) {
        console.error('❌ Registration error:', error);
        // Error handling is done by the API interceptor, so we don't need to show additional errors here
      }
    },

    // 前往登录页
    goToLogin() {
      this.$router.push('/login');
    },

    // Show terms of service
    showTerms() {
      this.showTermsPopup = true;
    },

    // Show privacy policy
    showPrivacy() {
      this.showPrivacyPopup = true;
    },

    // Close terms popup
    closeTermsPopup() {
      this.showTermsPopup = false;
    },

    // Close privacy popup
    closePrivacyPopup() {
      this.showPrivacyPopup = false;
    },

    // Toggle password visibility
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    // Toggle confirm password visibility
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  },

  mounted() {
    // 如果已登录，重定向到首页
    if (this.$store.state.auth.isAuthenticated) {
      this.$router.replace('/home');
    }
  },

  beforeDestroy() {
    // Clear countdown timer
    if (this.codeTimer) {
      clearInterval(this.codeTimer);
      this.codeTimer = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #2B4C8C 0%, #1E3A6F 50%, #0F2347 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.3)"/><circle cx="12" cy="8" r="0.3" fill="rgba(255,255,255,0.2)"/><circle cx="18" cy="15" r="0.4" fill="rgba(255,255,255,0.25)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>') repeat;
    opacity: 0.6;
  }
}

.register-content {
  width: 100%;
  max-width: 400px;
  padding: 40px 24px;
  position: relative;
  z-index: 2;
}

.logo-section {
  text-align: center;
  margin-bottom: 48px;

  h2 {
    margin: 0 0 8px;
    color: white;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  p {
    color: rgba(255, 255, 255, 1);
    font-size: 16px;
    margin: 0;
    font-weight: 400;
  }
}

.register-form {
  margin-bottom: 32px;

  .field-group {
    margin-bottom: 20px;
  }

  .field-error {
    color: #ff4757;
    font-size: 12px;
    margin-top: 4px;
    padding-left: 4px;
    min-height: 16px;
  }

  .field-label {
    display: block;
    color: rgba(255, 255, 255, 1);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    padding-left: 4px;
  }

  .custom-field {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &:focus-within {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    // 隐藏 Vant 默认的错误提示
    :deep(.van-field__error-message) {
      display: none;
    }

    :deep(.van-field__control) {
      font-size: 16px;
      color: white;
      background: transparent !important;
      padding: 16px;

      &::placeholder {
        color: rgba(255, 255, 255, 1);
      }

      // 移除浏览器自动填充的背景色
      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px transparent inset !important;
        -webkit-text-fill-color: white !important;
        background-color: transparent !important;
        background-image: none !important;
        transition: background-color 5000s ease-in-out 0s;
      }
    }

    :deep(.van-field__left-icon) {
      color: rgba(255, 255, 255, 1);
      margin-right: 12px;
    }

    :deep(.van-field__clear) {
      color: rgba(255, 255, 255, 1);
    }
  }

  .password-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .password-field {
      flex: 1;
      padding-right: 50px; // 为图标留出空间
    }

    .password-toggle-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;

      &:hover {
        color: rgba(255, 255, 255, 1);
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-50%) scale(1.1);
      }

      &:active {
        transform: translateY(-50%) scale(0.95);
      }

      svg {
        width: 20px;
        height: 20px;
        stroke: currentColor;
      }
    }
  }

  .verification-field {
    display: flex;
    gap: 12px;
    align-items: center;

    .verification-input {
      flex: 1;
    }

    .send-code-button {
      height: 48px;
      min-width: 100px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }
  }

  .password-strength {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 16px;
    margin: 12px 0 24px;

    .strength-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .strength-label {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
      }

      .strength-text {
        font-size: 12px;
        font-weight: 600;

        &.weak {
          color: #ff4757;
        }

        &.medium {
          color: #ffa726;
        }

        &.strong {
          color: #ffeb3b;
        }

        &.very-strong {
          color: #4caf50;
        }

        &.excellent {
          color: #2196f3;
        }
      }
    }

    .strength-bar {
      height: 6px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;

      .strength-fill {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 3px;

        &.weak {
          background: linear-gradient(90deg, #ff4757 0%, #ff6b7a 100%);
        }

        &.medium {
          background: linear-gradient(90deg, #ffa726 0%, #ffb74d 100%);
        }

        &.strong {
          background: linear-gradient(90deg, #ffeb3b 0%, #fff176 100%);
        }

        &.very-strong {
          background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
        }

        &.excellent {
          background: linear-gradient(90deg, #2196f3 0%, #42a5f5 100%);
        }
      }
    }

    .strength-tips {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.4;
    }
  }

  .form-options {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin: 24px 0 32px;
    font-size: 14px;

    :deep(.van-checkbox) {
      display: flex;
      align-items: flex-start;
      
      .van-checkbox__icon {
        margin-right: 8px;
        margin-top: 2px;
        
        .van-icon {
          border: 2px solid rgba(255, 255, 255, 0.5) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px !important;
          width: 18px !important;
          height: 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }
        
        &.van-checkbox__icon--checked .van-icon {
          background: #1989fa !important;
          border-color: #1989fa !important;
          
          &::before {
            content: '✓';
            color: white;
            font-size: 12px;
            font-weight: bold;
          }
        }
      }

      .van-checkbox__label {
        color: rgba(255, 255, 255, 1) !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        flex: 1;
      }
    }

    .terms-text {
      color: rgba(255, 255, 255, 1);
    }

    .terms-link {
      color: #40a9ff;
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: #69c0ff;
      }
    }
  }

  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  .register-button {
    width: 200px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: rgba(255, 255, 255, 1);
    color: #2B4C8C;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
      background: white;

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.7;
      transform: none;

      &:hover {
        transform: none;
      }
    }
  }
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 1);
  margin-top: 32px;

  .link {
    color: #1989fa;
    cursor: pointer;
    margin-left: 4px;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #40a9ff;
    }
  }
}

// 自定义蒙层样式
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

// 弹窗样式
.terms-popup,
.privacy-popup {
  :deep(.van-popup) {
    position: relative !important;
    background: white !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
    max-width: 90vw !important;
    max-height: 90vh !important;
    z-index: 9999 !important;
    margin: 0 !important;
    transform: none !important;
    animation: popupSlideIn 0.3s ease-out;
  }

  .popup-content {
    padding: 32px 24px;
    text-align: center;
    min-width: 280px;
    max-width: 400px;
    background: white;
    border-radius: 12px;
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
      text-align: left;

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
}

@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .register-content {
    max-width: 100%;
    padding: 32px 20px;
  }

  .logo-section {
    margin-bottom: 40px;

    h2 {
      font-size: 24px;
    }

    p {
      font-size: 15px;
    }
  }
}

@media (max-width: 375px) {
  .register-content {
    padding: 24px 16px;
  }

  .logo-section {
    margin-bottom: 32px;

    h2 {
      font-size: 22px;
    }
  }

  .popup-content {
    padding: 20px;
    max-width: 300px;
  }
}

@media (max-height: 700px) {
  .register-content {
    padding: 20px 24px;
  }

  .logo-section {
    margin-bottom: 32px;
  }

  .register-form {
    margin-bottom: 24px;
  }
}
</style>