import Cookies from 'js-cookie';

/**
 * Cookie 认证工具类
 * 用于管理基于 Cookie 的认证状态
 */
class CookieAuth {
  constructor() {
    // Cookie 配置
    this.config = {
      // Token cookie 名称
      tokenKey: 'threadbond_token',
      // 刷新 token cookie 名称
      refreshTokenKey: 'threadbond_refresh_token',
      // 认证状态 cookie 名称
      authStatusKey: 'threadbond_auth_status',
      // 用户信息 cookie 名称
      userInfoKey: 'threadbond_user_info',
      // 默认过期时间（7天）
      defaultExpires: 7,
      // Cookie 选项
      options: {
        secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
        sameSite: 'lax', // CSRF 保护
        path: '/' // 全站可用
      }
    };
  }

  /**
   * 设置认证 Token
   * @param {string} token - JWT Token
   * @param {number} expires - 过期天数，默认7天
   */
  setToken(token, expires = this.config.defaultExpires) {
    if (token) {
      Cookies.set(this.config.tokenKey, token, {
        expires,
        ...this.config.options
      });
      console.log('🍪 Token 已保存到 Cookie');
    } else {
      this.removeToken();
    }
  }

  /**
   * 获取认证 Token
   * @returns {string|null} JWT Token
   */
  getToken() {
    const token = Cookies.get(this.config.tokenKey);
    console.log('🍪 从 Cookie 获取 Token:', token ? '存在' : '不存在');
    return token || null;
  }

  /**
   * 移除认证 Token
   */
  removeToken() {
    Cookies.remove(this.config.tokenKey, { path: this.config.options.path });
    console.log('🍪 Token 已从 Cookie 中移除');
  }

  /**
   * 设置刷新 Token
   * @param {string} refreshToken - 刷新 Token
   * @param {number} expires - 过期天数，默认30天
   */
  setRefreshToken(refreshToken, expires = 30) {
    if (refreshToken) {
      Cookies.set(this.config.refreshTokenKey, refreshToken, {
        expires,
        ...this.config.options
      });
      console.log('🍪 刷新 Token 已保存到 Cookie');
    } else {
      this.removeRefreshToken();
    }
  }

  /**
   * 获取刷新 Token
   * @returns {string|null} 刷新 Token
   */
  getRefreshToken() {
    return Cookies.get(this.config.refreshTokenKey) || null;
  }

  /**
   * 移除刷新 Token
   */
  removeRefreshToken() {
    Cookies.remove(this.config.refreshTokenKey, { path: this.config.options.path });
    console.log('🍪 刷新 Token 已从 Cookie 中移除');
  }

  /**
   * 设置认证状态
   * @param {boolean} isAuthenticated - 是否已认证
   */
  setAuthStatus(isAuthenticated) {
    if (isAuthenticated) {
      Cookies.set(this.config.authStatusKey, 'true', {
        expires: this.config.defaultExpires,
        ...this.config.options
      });
      console.log('🍪 认证状态已保存到 Cookie: true');
    } else {
      this.removeAuthStatus();
    }
  }

  /**
   * 获取认证状态
   * @returns {boolean} 是否已认证
   */
  getAuthStatus() {
    const status = Cookies.get(this.config.authStatusKey) === 'true';
    console.log('🍪 从 Cookie 获取认证状态:', status);
    return status;
  }

  /**
   * 移除认证状态
   */
  removeAuthStatus() {
    Cookies.remove(this.config.authStatusKey, { path: this.config.options.path });
    console.log('🍪 认证状态已从 Cookie 中移除');
  }

  /**
   * 设置用户信息
   * @param {Object} userInfo - 用户信息对象
   */
  setUserInfo(userInfo) {
    if (userInfo) {
      try {
        const userInfoStr = JSON.stringify(userInfo);
        Cookies.set(this.config.userInfoKey, userInfoStr, {
          expires: this.config.defaultExpires,
          ...this.config.options
        });
        console.log('🍪 用户信息已保存到 Cookie');
      } catch (error) {
        console.error('🍪 保存用户信息到 Cookie 失败:', error);
      }
    } else {
      this.removeUserInfo();
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息对象
   */
  getUserInfo() {
    try {
      const userInfoStr = Cookies.get(this.config.userInfoKey);
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        console.log('🍪 从 Cookie 获取用户信息:', userInfo);
        return userInfo;
      }
    } catch (error) {
      console.error('🍪 从 Cookie 解析用户信息失败:', error);
      this.removeUserInfo(); // 清除损坏的数据
    }
    return null;
  }

  /**
   * 移除用户信息
   */
  removeUserInfo() {
    Cookies.remove(this.config.userInfoKey, { path: this.config.options.path });
    console.log('🍪 用户信息已从 Cookie 中移除');
  }

  /**
   * 清除所有认证相关的 Cookie
   */
  clearAll() {
    console.log('🍪 清除所有认证相关的 Cookie');
    this.removeToken();
    this.removeRefreshToken();
    this.removeAuthStatus();
    this.removeUserInfo();
    
    // 同时清除 localStorage 中的旧数据（向后兼容）
    localStorage.removeItem('threadbond-token');
    localStorage.removeItem('threadbond-refresh-token');
    localStorage.removeItem('threadbond-user');
  }

  /**
   * 检查是否有有效的认证信息
   * @returns {boolean} 是否有有效认证
   */
  hasValidAuth() {
    const hasToken = !!this.getToken();
    const hasAuthStatus = this.getAuthStatus();
    const isValid = hasToken && hasAuthStatus;
    
    console.log('🍪 检查认证有效性:', {
      hasToken,
      hasAuthStatus,
      isValid
    });
    
    return isValid;
  }

  /**
   * 从 localStorage 迁移到 Cookie（向后兼容）
   */
  migrateFromLocalStorage() {
    console.log('🔄 检查是否需要从 localStorage 迁移数据到 Cookie');
    
    // 迁移 token
    const oldToken = localStorage.getItem('threadbond-token');
    if (oldToken && !this.getToken()) {
      console.log('🔄 迁移 Token 到 Cookie');
      this.setToken(oldToken);
      localStorage.removeItem('threadbond-token');
    }

    // 迁移刷新 token
    const oldRefreshToken = localStorage.getItem('threadbond-refresh-token');
    if (oldRefreshToken && !this.getRefreshToken()) {
      console.log('🔄 迁移刷新 Token 到 Cookie');
      this.setRefreshToken(oldRefreshToken);
      localStorage.removeItem('threadbond-refresh-token');
    }

    // 迁移用户信息
    const oldUserInfo = localStorage.getItem('threadbond-user');
    if (oldUserInfo && !this.getUserInfo()) {
      try {
        console.log('🔄 迁移用户信息到 Cookie');
        const userInfo = JSON.parse(oldUserInfo);
        this.setUserInfo(userInfo);
        localStorage.removeItem('threadbond-user');
      } catch (error) {
        console.error('🔄 迁移用户信息失败:', error);
        localStorage.removeItem('threadbond-user'); // 清除损坏的数据
      }
    }

    // 如果有 token，设置认证状态
    if (this.getToken()) {
      this.setAuthStatus(true);
    }
  }

  /**
   * 获取 Cookie 配置信息（用于调试）
   * @returns {Object} 配置信息
   */
  getConfig() {
    return {
      ...this.config,
      currentValues: {
        token: !!this.getToken(),
        refreshToken: !!this.getRefreshToken(),
        authStatus: this.getAuthStatus(),
        userInfo: !!this.getUserInfo()
      }
    };
  }
}

// 创建单例实例
const cookieAuth = new CookieAuth();

export default cookieAuth;