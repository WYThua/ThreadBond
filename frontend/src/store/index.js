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
  strict: process.env.NODE_ENV !== 'production',

  // 插件
  plugins: [
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