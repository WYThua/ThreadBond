import { authAPI } from '@/api/auth';
import cookieAuth from '@/utils/cookieAuth';

// 认证状态管理
const state = {
  // 认证状态
  isAuthenticated: cookieAuth.getAuthStatus(),
  
  // 用户令牌
  token: cookieAuth.getToken(),
  
  // 刷新令牌
  refreshToken: cookieAuth.getRefreshToken(),
  
  // 登录状态
  loginLoading: false,
  
  // 注册状态
  registerLoading: false
};

const mutations = {
  // 设置认证状态
  SET_AUTHENTICATED(state, status) {
    state.isAuthenticated = status;
    cookieAuth.setAuthStatus(status);
  },
  
  // 设置令牌
  SET_TOKEN(state, token) {
    state.token = token;
    cookieAuth.setToken(token);
  },
  
  // 设置刷新令牌
  SET_REFRESH_TOKEN(state, refreshToken) {
    state.refreshToken = refreshToken;
    cookieAuth.setRefreshToken(refreshToken);
  },
  
  // 设置登录加载状态
  SET_LOGIN_LOADING(state, loading) {
    state.loginLoading = loading;
  },
  
  // 设置注册加载状态
  SET_REGISTER_LOADING(state, loading) {
    state.registerLoading = loading;
  },
  
  // 清除认证信息
  CLEAR_AUTH(state) {
    state.isAuthenticated = false;
    state.token = null;
    state.refreshToken = null;
    cookieAuth.clearAll();
  }
};

const actions = {
  // 检查认证状态
  async checkAuthStatus({ commit, state }) {
    console.log('🔍 检查认证状态，当前 token:', state.token ? '存在' : '不存在');
    
    if (state.token) {
      try {
        console.log('📡 调用 verifyToken API...');
        const response = await authAPI.verifyToken();
        console.log('📡 verifyToken 响应:', response);
        
        if (response.success) {
          console.log('✅ Token 验证成功');
          commit('SET_AUTHENTICATED', true);
          
          // 如果响应中包含用户信息，更新用户状态
          if (response.data && response.data.user) {
            console.log('👤 更新用户信息:', response.data.user);
            commit('user/SET_USER_INFO', response.data.user, { root: true });
          }
          if (response.data && response.data.anonymousIdentity) {
            console.log('🎭 更新匿名身份:', response.data.anonymousIdentity);
            commit('user/SET_ANONYMOUS_IDENTITY', response.data.anonymousIdentity, { root: true });
          }
          
          return true;
        } else {
          console.log('❌ Token 验证失败:', response.message);
          commit('CLEAR_AUTH');
          return false;
        }
      } catch (error) {
        console.error('❌ 认证状态检查失败:', error);
        // 如果是网络错误，不清除认证状态，给用户重试机会
        if (error.isNetworkError) {
          console.log('🌐 网络错误，保持当前认证状态');
          return false;
        }
        commit('CLEAR_AUTH');
        return false;
      }
    } else {
      console.log('🚫 没有 token，设置为未认证状态');
      commit('SET_AUTHENTICATED', false);
      return false;
    }
  },

  // 初始化认证状态
  async initializeAuth({ commit, state, dispatch }) {
    console.log('🚀 初始化认证状态...');
    
    // 首先尝试从 localStorage 迁移数据到 Cookie
    cookieAuth.migrateFromLocalStorage();
    
    // 重新从 Cookie 获取最新状态
    const token = cookieAuth.getToken();
    const authStatus = cookieAuth.getAuthStatus();
    
    // 更新 Vuex 状态
    if (token !== state.token) {
      commit('SET_TOKEN', token);
    }
    if (authStatus !== state.isAuthenticated) {
      commit('SET_AUTHENTICATED', authStatus);
    }
    
    // 如果有 token，尝试验证
    if (token) {
      try {
        console.log('🔍 发现 Token，验证有效性...');
        const isValid = await dispatch('checkAuthStatus');
        return isValid;
      } catch (error) {
        console.error('❌ 认证初始化失败:', error);
        commit('CLEAR_AUTH');
        return false;
      }
    } else {
      console.log('🚫 没有 Token，设置为未认证状态');
      commit('SET_AUTHENTICATED', false);
      return false;
    }
  },
  
  // 用户登录
  async login({ commit }, credentials) {
    commit('SET_LOGIN_LOADING', true);
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        commit('SET_TOKEN', response.data.token);
        commit('SET_AUTHENTICATED', true);
        
        // 存储用户信息到用户模块和 Cookie
        if (response.data.user) {
          commit('user/SET_USER_INFO', response.data.user, { root: true });
          cookieAuth.setUserInfo(response.data.user);
        }
        if (response.data.anonymousIdentity) {
          commit('user/SET_ANONYMOUS_IDENTITY', response.data.anonymousIdentity, { root: true });
        }
        
        console.log('✅ 登录成功，认证信息已保存到 Cookie');
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
      
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: error.message || '登录失败' };
    } finally {
      commit('SET_LOGIN_LOADING', false);
    }
  },
  
  // 用户注册
  async register({ commit }, userData) {
    commit('SET_REGISTER_LOADING', true);
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // 注册成功后自动登录
        commit('SET_TOKEN', response.data.token);
        commit('SET_AUTHENTICATED', true);
        
        // 存储用户信息到用户模块和 Cookie
        if (response.data.user) {
          commit('user/SET_USER_INFO', response.data.user, { root: true });
          cookieAuth.setUserInfo(response.data.user);
        }
        if (response.data.anonymousIdentity) {
          commit('user/SET_ANONYMOUS_IDENTITY', response.data.anonymousIdentity, { root: true });
        }
        
        console.log('✅ 注册成功，认证信息已保存到 Cookie');
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
      
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, message: error.message || '注册失败' };
    } finally {
      commit('SET_REGISTER_LOADING', false);
    }
  },
  
  // 用户登出
  async logout({ commit }) {
    try {
      await authAPI.logout();
      
      commit('CLEAR_AUTH');
      
      // 清除其他相关状态
      commit('user/CLEAR_USER_INFO', null, { root: true });
      commit('chat/CLEAR_CHAT_DATA', null, { root: true });
      
      return { success: true, message: '登出成功' };
      
    } catch (error) {
      console.error('登出失败:', error);
      // 即使 API 调用失败，也要清除本地状态
      commit('CLEAR_AUTH');
      return { success: false, message: error.message || '登出失败' };
    }
  },
  
  // 刷新令牌
  async refreshToken({ commit, state }) {
    if (!state.refreshToken) {
      commit('CLEAR_AUTH');
      return { success: false, message: '无刷新令牌' };
    }
    
    try {
      const response = await authAPI.refreshToken();
      
      if (response.success) {
        commit('SET_TOKEN', response.data.token);
        if (response.data.refreshToken) {
          commit('SET_REFRESH_TOKEN', response.data.refreshToken);
        }
        return { success: true };
      } else {
        commit('CLEAR_AUTH');
        return { success: false, message: response.message };
      }
      
    } catch (error) {
      console.error('令牌刷新失败:', error);
      commit('CLEAR_AUTH');
      return { success: false, message: error.message || '令牌刷新失败' };
    }
  },

  // 检查邮箱是否可用
  async checkEmailAvailability({ commit }, email) {
    try {
      const response = await authAPI.checkEmail(email);
      return response;
    } catch (error) {
      console.error('邮箱检查失败:', error);
      return { success: false, message: error.message || '邮箱检查失败' };
    }
  }
};

const getters = {
  // 是否已认证
  isAuthenticated: state => state.isAuthenticated,
  
  // 获取令牌
  token: state => state.token,
  
  // 是否正在登录
  isLoggingIn: state => state.loginLoading,
  
  // 是否正在注册
  isRegistering: state => state.registerLoading
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};