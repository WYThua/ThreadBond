import axios from 'axios';
import store from '@/store';
import { Toast } from 'vant';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
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
    
    // 如果是失败响应，抛出错误
    const error = new Error(data.message || '请求失败');
    error.code = data.code;
    return Promise.reject(error);
  },
  async error => {
    console.error('响应拦截器错误:', error);
    
    // 处理网络错误
    if (!error.response) {
      Toast.fail('网络连接失败，请检查网络设置');
      return Promise.reject(new Error('网络连接失败'));
    }
    
    const { status, data } = error.response;
    
    // 处理不同的 HTTP 状态码
    switch (status) {
      case 401:
        // 未授权，尝试刷新令牌
        try {
          const refreshResult = await store.dispatch('auth/refreshToken');
          if (refreshResult.success) {
            // 刷新成功，重试原请求
            return api.request(error.config);
          } else {
            // 刷新失败，跳转到登录页
            store.dispatch('auth/logout');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        } catch (refreshError) {
          console.error('令牌刷新失败:', refreshError);
          store.dispatch('auth/logout');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        break;
        
      case 403:
        Toast.fail('权限不足');
        break;
        
      case 404:
        Toast.fail('请求的资源不存在');
        break;
        
      case 429:
        Toast.fail('请求过于频繁，请稍后再试');
        break;
        
      case 500:
        Toast.fail('服务器内部错误');
        break;
        
      default:
        Toast.fail(data?.message || `请求失败 (${status})`);
    }
    
    return Promise.reject(error);
  }
);

export default api;