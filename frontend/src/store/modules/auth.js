import { authAPI } from '@/api/auth';

// 认证状态管理
const state = {
  // 认证状态
  isAuthenticated: false,
  
  // 用户令牌
  token: localStorage.getItem('threadbond-token') || null,
  
  // 刷新令牌
  refreshToken: localStorage.getItem('threadbond-refresh-token') || null,
  
  // 登录状态
  loginLoading: false,
  
  // 注册状态
  registerLoading: false
};

const mutations = {
  // 设置认证状态
  SET_AUTHENTICATED(state, status) {
    state.isAuthenticated = status;
  },
  
  // 设置令牌
  SET_TOKEN(state, token) {
    state.token = token;
    if (token) {
      localStorage.setItem('threadbond-token', token);
    } else {
      localStorage.removeItem('threadbond-token');
    }
  },
  
  // 设置刷新令牌
  SET_REFRESH_TOKEN(state, refreshToken) {
    state.refreshToken = refreshToken;
    if (refreshToken) {
      localStorage.setItem('threadbond-refresh-token', refreshToken);
    } else {
      localStorage.removeItem('threadbond-refresh-token');
    }
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
    localStorage.removeItem('threadbond-token');
    localStorage.removeItem('threadbond-refresh-token');
    localStorage.removeItem('threadbond-user');
  }
};

const actions = {
  // 检查认证状态
  async checkAuthStatus({ commit, state }) {
    if (state.token) {
      try {
        const response = await authAPI.verifyToken();
        if (response.success) {
          commit('SET_AUTHENTICATED', true);
        } else {
          commit('CLEAR_AUTH');
        }
      } catch (error) {
        console.error('认证状态检查失败:', error);
        commit('CLEAR_AUTH');
      }
    } else {
      commit('SET_AUTHENTICATED', false);
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
        
        // 存储用户信息到用户模块
        commit('user/SET_USER_INFO', response.data.user, { root: true });
        commit('user/SET_ANONYMOUS_IDENTITY', response.data.anonymousIdentity, { root: true });
        
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
        
        // 存储用户信息到用户模块
        commit('user/SET_USER_INFO', response.data.user, { root: true });
        commit('user/SET_ANONYMOUS_IDENTITY', response.data.anonymousIdentity, { root: true });
        
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