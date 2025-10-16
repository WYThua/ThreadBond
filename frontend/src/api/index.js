import axios from 'axios';
import store from '@/store';
import { Toast } from 'vant';
import errorCodeTranslator from '@/utils/errorCodeTranslator';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true, // 支持跨域携带 cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加认证令牌
    const token = store.getters['auth/token'];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 统一处理响应数据
    const { data } = response;
    
    // 如果是成功响应，直接返回数据
    if (data.success) {
      return data;
    }
    
    // 如果是失败响应，抛出错误，但保留原始响应信息
    const error = new Error(data.message || '请求失败');
    error.code = data.code;
    error.response = response; // 保留响应信息
    return Promise.reject(error);
  },
  async error => {
    console.error('响应拦截器错误:', error);
    
    // 提取错误信息
    const errorInfo = errorCodeTranslator.extractErrorInfo(error);
    
    // 处理网络错误
    if (errorInfo.isNetworkError) {
      const friendlyMessage = errorCodeTranslator.translateNetworkError(error);
      Toast.fail(friendlyMessage);
      
      // 创建新的错误对象，隐藏技术细节
      const userFriendlyError = new Error(friendlyMessage);
      userFriendlyError.isNetworkError = true;
      return Promise.reject(userFriendlyError);
    }
    
    const { status } = error.response;
    
    // 特殊处理401错误 - 尝试刷新令牌
    if (status === 401) {
      try {
        const refreshResult = await store.dispatch('auth/refreshToken');
        if (refreshResult.success) {
          // 刷新成功，重试原请求
          return api.request(error.config);
        } else {
          // 刷新失败，显示登录相关的友好错误消息
          const friendlyMessage = errorCodeTranslator.translateLoginError(status, errorInfo.message);
          Toast.fail(friendlyMessage);
          
          // 跳转到登录页
          store.dispatch('auth/logout');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          // 返回友好的错误消息
          const userFriendlyError = new Error(friendlyMessage);
          userFriendlyError.statusCode = status;
          return Promise.reject(userFriendlyError);
        }
      } catch (refreshError) {
        console.error('令牌刷新失败:', refreshError);
        
        // 显示登录相关的友好错误消息
        const friendlyMessage = errorCodeTranslator.translateLoginError(status, errorInfo.message);
        Toast.fail(friendlyMessage);
        
        store.dispatch('auth/logout');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        const userFriendlyError = new Error(friendlyMessage);
        userFriendlyError.statusCode = status;
        return Promise.reject(userFriendlyError);
      }
    }
    
    // 使用错误码转换器获取友好的错误消息
    const friendlyMessage = errorCodeTranslator.translateBusinessError(status, errorInfo.message);
    Toast.fail(friendlyMessage);
    
    // 创建新的错误对象，隐藏技术状态码
    const userFriendlyError = new Error(friendlyMessage);
    userFriendlyError.statusCode = status;
    userFriendlyError.originalError = error;
    
    return Promise.reject(userFriendlyError);
  }
);

/**
 * 创建带有特定错误上下文的API实例
 * @param {string} context - 错误上下文（login, register, validation等）
 * @returns {Object} 带有上下文的API实例
 */
api.withErrorContext = function(context) {
  const contextApi = axios.create(this.defaults);
  
  // 复制请求拦截器
  contextApi.interceptors.request.use(...this.interceptors.request.handlers[0]);
  
  // 创建带上下文的响应拦截器
  contextApi.interceptors.response.use(
    response => {
      // 成功响应处理与原拦截器相同
      const { data } = response;
      
      if (data.success) {
        return data;
      }
      
      const error = new Error(data.message || '请求失败');
      error.code = data.code;
      error.response = response;
      return Promise.reject(error);
    },
    async error => {
      console.error(`响应拦截器错误 (${context}):`, error);
      
      // 提取错误信息
      const errorInfo = errorCodeTranslator.extractErrorInfo(error);
      
      // 处理网络错误
      if (errorInfo.isNetworkError) {
        const friendlyMessage = errorCodeTranslator.translateNetworkError(error);
        Toast.fail(friendlyMessage);
        
        const userFriendlyError = new Error(friendlyMessage);
        userFriendlyError.isNetworkError = true;
        return Promise.reject(userFriendlyError);
      }
      
      const { status } = error.response;
      
      // 特殊处理401错误
      if (status === 401) {
        try {
          const refreshResult = await store.dispatch('auth/refreshToken');
          if (refreshResult.success) {
            return contextApi.request(error.config);
          } else {
            const friendlyMessage = errorCodeTranslator.translate(error, context);
            Toast.fail(friendlyMessage);
            
            store.dispatch('auth/logout');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            
            const userFriendlyError = new Error(friendlyMessage);
            userFriendlyError.statusCode = status;
            return Promise.reject(userFriendlyError);
          }
        } catch (refreshError) {
          console.error('令牌刷新失败:', refreshError);
          
          const friendlyMessage = errorCodeTranslator.translate(error, context);
          Toast.fail(friendlyMessage);
          
          store.dispatch('auth/logout');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          const userFriendlyError = new Error(friendlyMessage);
          userFriendlyError.statusCode = status;
          return Promise.reject(userFriendlyError);
        }
      }
      
      // 使用上下文相关的错误转换
      const friendlyMessage = errorCodeTranslator.translate(error, context);
      Toast.fail(friendlyMessage);
      
      const userFriendlyError = new Error(friendlyMessage);
      userFriendlyError.statusCode = status;
      userFriendlyError.originalError = error;
      
      return Promise.reject(userFriendlyError);
    }
  );
  
  return contextApi;
};

export default api;