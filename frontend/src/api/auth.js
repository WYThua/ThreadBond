import api from './index';

/**
 * 认证相关 API
 */
export const authAPI = {
  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise} 注册结果
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败'
      };
    }
  },

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.email - 邮箱
   * @param {string} credentials.password - 密码
   * @returns {Promise} 登录结果
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败'
      };
    }
  },

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登出失败'
      };
    }
  },

  /**
   * 刷新令牌
   * @returns {Promise} 刷新结果
   */
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '令牌刷新失败'
      };
    }
  },

  /**
   * 检查邮箱是否可用
   * @param {string} email - 邮箱地址
   * @returns {Promise} 检查结果
   */
  async checkEmail(email) {
    try {
      const response = await api.post('/auth/check-email', { email });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '邮箱检查失败'
      };
    }
  },

  /**
   * 验证令牌有效性
   * @returns {Promise} 验证结果
   */
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '令牌验证失败'
      };
    }
  }
};