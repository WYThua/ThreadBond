<template>
  <div class="login-page">
    <div class="login-content">
      <!-- Logo section -->
      <div class="logo-section">
        <h2>Welcome Back</h2>
        <p>Sign in to your ThreadBond account</p>
      </div>

      <!-- Login form -->
      <van-form @submit="handleLogin" class="login-form">
        <div class="field-group">
          <label class="field-label">Email</label>
          <van-field v-model="form.email" name="email" placeholder="Enter your email address" left-icon="envelop-o"
            clearable :border="false" class="custom-field" @blur="validateEmail" @input="clearEmailError" />
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>
        </div>

        <div class="field-group">
          <label class="field-label">Password</label>
          <div class="password-input-wrapper">
            <van-field 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              name="password" 
              placeholder="Enter your password"
              left-icon="lock" 
              :border="false" 
              class="custom-field password-field" 
              @blur="validatePassword"
              @input="clearPasswordError" 
            />
            <div class="password-toggle-icon" @click="togglePasswordVisibility">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path v-if="!showPassword" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path v-if="!showPassword" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path v-if="showPassword" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </div>

        <div class="form-options">
          <van-checkbox v-model="form.rememberMe">Remember me</van-checkbox>
          <span class="forgot-password" @click="showForgotPassword">Forgot password?</span>
        </div>

        <div class="button-container">
          <van-button type="primary" native-type="submit" :loading="isLoggingIn" class="login-button">
            {{ isLoggingIn ? 'Signing in...' : 'Sign In' }}
          </van-button>
        </div>
      </van-form>

      <!-- Other login methods -->
      <div class="other-login">
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Third-party login can be added here -->
        <div class="social-login">
          <p class="social-login-text">Third-party login not supported yet</p>
        </div>
      </div>

      <!-- Register link -->
      <div class="register-link">
        <span>Don't have an account?</span>
        <span class="link" @click="goToRegister">Sign Up</span>
      </div>
    </div>

    <!-- Forgot password popup with overlay -->
    <div v-if="showForgotPasswordPopup" class="popup-overlay" @click="closeForgotPasswordPopup">
      <van-popup v-model="showForgotPasswordPopup" position="center" round closeable class="custom-popup"
        :z-index="9999" :overlay="false" lock-scroll @click.stop>
        <div class="popup-content">
          <h3>Reset Password</h3>
          <p>Please contact support to reset your password</p>
          <button class="popup-button" @click="closeForgotPasswordPopup">
            Got it
          </button>
        </div>
      </van-popup>
    </div>

    <!-- Login result popup with overlay -->
    <div v-if="showLoginResultPopup" class="popup-overlay" @click="closeLoginResultPopup">
      <van-popup v-model="showLoginResultPopup" position="center" round closeable class="custom-popup" :z-index="10000"
        :overlay="false" lock-scroll @click.stop>
        <div class="popup-content">
          <h3 :class="{ success: loginResult.success, error: !loginResult.success }">
            {{ loginResult.success ? 'Login Successful' : 'Login Failed' }}
          </h3>
          <p>{{ loginResult.message }}</p>
          <button class="popup-button" @click="closeLoginResultPopup">
            OK
          </button>
        </div>
      </van-popup>
    </div>
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
      showForgotPasswordPopup: false,
      showLoginResultPopup: false,
      loginResult: {
        success: false,
        message: ''
      },
      errors: {
        email: '',
        password: ''
      },
      showPassword: false
    };
  },

  computed: {
    ...mapGetters('auth', ['isLoggingIn'])
  },

  methods: {
    ...mapActions('auth', ['login']),

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
        this.errors.password = 'Please enter your password';
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters';
      } else {
        this.errors.password = '';
      }
    },

    // Clear email error when user starts typing
    clearEmailError() {
      if (this.errors.email && this.form.email) {
        this.errors.email = '';
      }
    },

    // Clear password error when user starts typing
    clearPasswordError() {
      if (this.errors.password && this.form.password) {
        this.errors.password = '';
      }
    },

    // Validate entire form
    validateForm() {
      this.validateEmail();
      this.validatePassword();

      return !this.errors.email && !this.errors.password;
    },

    // Handle login
    async handleLogin() {
      console.log('🚀 Login button clicked, starting login process...');

      // Clear previous errors
      this.errors = { email: '', password: '' };

      // Validate form
      if (!this.validateForm()) {
        console.log('❌ Form validation failed');
        return;
      }

      console.log('✅ Form validation passed, calling login API...');
      console.log('📧 Email:', this.form.email);
      console.log('🔒 Password length:', this.form.password.length);

      try {
        const result = await this.login({
          email: this.form.email,
          password: this.form.password
        });

        console.log('📡 Login API response:', result);

        // Show result in popup with specific message
        if (result.success) {
          this.loginResult = {
            success: true,
            message: result.message || 'Welcome back! You have successfully logged in.'
          };
        } else {
          // Handle specific failure cases
          let failureMessage = result.message;

          if (!failureMessage) {
            failureMessage = 'Login failed. Please check your email and password.';
          } else if (failureMessage.includes('User not found')) {
            failureMessage = 'No account found with this email address. Please check your email or sign up.';
          } else if (failureMessage.includes('Invalid password')) {
            failureMessage = 'Incorrect password. Please check your password and try again.';
          } else if (failureMessage.includes('account disabled')) {
            failureMessage = 'Your account has been disabled. Please contact support for assistance.';
          }

          this.loginResult = {
            success: false,
            message: failureMessage
          };
        }

        this.showLoginResultPopup = true;

        // If successful, redirect after popup is closed
        if (result.success) {
          // Auto close popup after 2 seconds and redirect
          setTimeout(() => {
            this.showLoginResultPopup = false;
            const redirect = this.$route.query.redirect || '/home';
            this.$router.replace(redirect);
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Login error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });

        // Determine specific error message
        let errorMessage = 'An unexpected error occurred. Please try again.';

        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;

          // Always prioritize backend message if it exists and is user-friendly
          if (data?.message && !data.message.includes('status code') && !data.message.includes('Request failed with')) {
            errorMessage = data.message;
          } else if (status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (status === 400) {
            errorMessage = 'Invalid request. Please check your input and try again.';
          } else if (status === 429) {
            errorMessage = 'Too many login attempts. Please wait a moment and try again.';
          } else if (status === 500) {
            errorMessage = 'Server error. Please try again later or contact support.';
          } else if (status >= 500) {
            errorMessage = 'Server is temporarily unavailable. Please try again later.';
          } else {
            errorMessage = 'Request failed. Please try again.';
          }
        } else if (error.request) {
          // Network error - no response received
          if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
          } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Cannot connect to server. Please check if the service is running.';
          } else if (error.code === 'TIMEOUT') {
            errorMessage = 'Request timed out. Please check your connection and try again.';
          } else {
            errorMessage = 'Network error. Please check your connection and try again.';
          }
        } else {
          // Other errors - avoid showing technical error messages
          if (error.message && !error.message.includes('status code') && !error.message.includes('Request failed')) {
            errorMessage = error.message;
          } else {
            errorMessage = 'An unexpected error occurred. Please try again.';
          }
        }

        // Show specific error in popup
        this.loginResult = {
          success: false,
          message: errorMessage
        };
        this.showLoginResultPopup = true;
      }
    },

    // Close forgot password popup
    closeForgotPasswordPopup() {
      console.log('🔘 Closing forgot password popup...');
      this.showForgotPasswordPopup = false;
    },

    // Close login result popup
    closeLoginResultPopup() {
      console.log('🔘 Closing login result popup...');
      this.showLoginResultPopup = false;

      // If login was successful, redirect to home
      if (this.loginResult.success) {
        console.log('✅ Login was successful, redirecting...');
        const redirect = this.$route.query.redirect || '/home';
        this.$router.replace(redirect);
      }
    },

    // Navigate to register page
    goToRegister() {
      this.$router.push('/register');
    },

    // Show forgot password popup
    showForgotPassword() {
      this.showForgotPasswordPopup = true;
    },

    // Toggle password visibility
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  },

  mounted() {
    // Redirect to home if already authenticated
    if (this.$store.state.auth.isAuthenticated) {
      this.$router.replace('/home');
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
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

.login-content {
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

.login-form {
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

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 24px 0 32px;
    font-size: 14px;

    :deep(.van-checkbox) {
      .van-checkbox__label {
        color: rgba(255, 255, 255, 1);
        font-size: 14px;
      }

      .van-checkbox__icon {
        .van-icon {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .forgot-password {
      color: rgba(255, 255, 255, 1);
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: white;
      }
    }
  }

  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  .login-button {
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

.other-login {
  margin: 32px 0;

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 24px 0;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    span {
      padding: 0 16px;
      color: rgba(255, 255, 255, 1);
      font-size: 14px;
      white-space: nowrap;
    }
  }

  .social-login {
    text-align: center;

    .social-login-text {
      color: rgba(255, 255, 255, 1);
      font-size: 14px;
      margin: 20px 0;
    }
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 1);

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

// 弹窗样式 - 绝对定位和背景颜色
.custom-popup {
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

    h3 {
      margin: 0 0 16px;
      color: #323233;
      font-size: 20px;
      font-weight: 600;

      &.success {
        color: #07c160;
      }

      &.error {
        color: #ee0a24;
      }
    }

    p {
      margin: 0 0 24px;
      color: #646566;
      font-size: 15px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .popup-button {
      min-width: 80px;
      background: #1989fa;
      border: none;
      color: white;
      border-radius: 6px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);

      &:hover {
        background: #40a9ff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(25, 137, 250, 0.3);
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.2);
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

// 全局弹窗样式覆盖 - 确保绝对定位生效
:deep(.van-popup--center) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 10000 !important;
}

// Responsive design
@media (max-width: 768px) {
  .login-content {
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
  .login-content {
    padding: 24px 16px;
  }

  .logo-section {
    margin-bottom: 32px;

    h2 {
      font-size: 22px;
    }
  }
}

@media (max-height: 700px) {
  .login-content {
    padding: 20px 24px;
  }

  .logo-section {
    margin-bottom: 32px;
  }

  .login-form {
    margin-bottom: 24px;
  }
}
</style>