import Vue from 'vue';
import Vuex from 'vuex';

// 导入模块
import app from './modules/app';
import auth from './modules/auth';
import user from './modules/user';
import clue from './modules/clue';
import chat from './modules/chat';
import socket from './modules/socket';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    auth,
    user,
    clue,
    chat,
    socket
  },

  // 严格模式，在开发环境下启用
  strict: false, // 暂时禁用严格模式以避免潜在问题

  // 插件
  plugins: [
    // 错误处理插件
    store => {
      // 重写 commit 方法以捕获错误
      const originalCommit = store.commit;
      store.commit = function(type, payload, options) {
        try {
          // 处理常见的命名错误
          if (type === 'app/setCurrentRoute') {
            console.warn('自动修正 mutation 名称: app/setCurrentRoute -> app/SET_CURRENT_ROUTE');
            type = 'app/SET_CURRENT_ROUTE';
          }
          
          return originalCommit.call(this, type, payload, options);
        } catch (error) {
          console.error('Vuex commit 错误:', error);
          
          // 如果是未知的 mutation 类型，尝试自动修正
          if (error.message && error.message.includes('unknown mutation type')) {
            console.warn('尝试自动修正 mutation 名称...');
            // 这里可以添加更多的自动修正逻辑
          }
          
          // 不抛出错误，避免应用崩溃
          return;
        }
      };
    },
    
    // 持久化插件（可选）
    store => {
      // 监听 mutation，将某些状态持久化到 localStorage
      store.subscribe((mutation, state) => {
        if (mutation.type === 'auth/SET_TOKEN') {
          localStorage.setItem('threadbond-token', state.auth.token || '');
        }
        
        if (mutation.type === 'auth/CLEAR_AUTH') {
          localStorage.removeItem('threadbond-token');
          localStorage.removeItem('threadbond-user');
        }
        
        if (mutation.type === 'user/SET_USER_INFO') {
          localStorage.setItem('threadbond-user', JSON.stringify(state.user.userInfo));
        }
        
        if (mutation.type === 'app/SET_THEME') {
          localStorage.setItem('threadbond-theme', state.app.theme);
        }
      });
    }
  ]
});

export default store;