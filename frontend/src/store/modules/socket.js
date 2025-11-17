// Socket.IO 连接状态管理
const state = {
  // Socket 实例
  socket: null,
  
  // 连接状态
  connected: false,
  
  // 重连尝试次数
  reconnectAttempts: 0,
  
  // 最大重连次数
  maxReconnectAttempts: 5,
  
  // 重连间隔（毫秒）
  reconnectInterval: 3000,
  
  // 连接错误
  connectionError: null
};

const mutations = {
  // 设置 Socket 实例
  SET_SOCKET(state, socket) {
    state.socket = socket;
  },
  
  // 设置连接状态
  SET_CONNECTED(state, connected) {
    state.connected = connected;
  },
  
  // 设置重连尝试次数
  SET_RECONNECT_ATTEMPTS(state, attempts) {
    state.reconnectAttempts = attempts;
  },
  
  // 增加重连尝试次数
  INCREMENT_RECONNECT_ATTEMPTS(state) {
    state.reconnectAttempts += 1;
  },
  
  // 重置重连尝试次数
  RESET_RECONNECT_ATTEMPTS(state) {
    state.reconnectAttempts = 0;
  },
  
  // 设置连接错误
  SET_CONNECTION_ERROR(state, error) {
    state.connectionError = error;
  },
  
  // 清除连接错误
  CLEAR_CONNECTION_ERROR(state) {
    state.connectionError = null;
  }
};

const actions = {
  // 连接 Socket.IO
  async connect({ commit, dispatch, rootState }) {
    try {
      // 暂时禁用 Socket 连接以避免认证问题
      console.log('⚠️ Socket 连接暂时禁用，避免认证错误');
      return { success: false, message: 'Socket 连接已禁用' };
      
      // 检查是否已经连接
      if (state.socket && state.connected) {
        return { success: true, message: '已经连接' };
      }
      
      // 检查用户是否已登录
      if (!rootState.auth.isAuthenticated || !rootState.auth.token) {
        console.log('用户未登录，跳过 Socket 连接');
        return { success: false, message: '用户未登录' };
      }
      
      // 验证 token 是否有效
      console.log('验证 token 有效性...');
      const authCheck = await dispatch('auth/checkAuthStatus', null, { root: true });
      if (!authCheck) {
        console.log('Token 验证失败，跳过 Socket 连接');
        return { success: false, message: 'Token 无效' };
      }
      
      console.log('开始建立 Socket 连接...');
      
      // 动态导入 socket.io-client
      const { io } = await import('socket.io-client');
      
      // 创建 Socket 连接
      const socket = io(rootState.app.config.socketUrl, {
        auth: {
          token: rootState.auth.token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });
      
      commit('SET_SOCKET', socket);
      
      // 设置事件监听器
      dispatch('setupSocketListeners', socket);
      
      return { success: true, message: '正在连接...' };
      
    } catch (error) {
      console.error('Socket 连接失败:', error);
      commit('SET_CONNECTION_ERROR', error.message);
      return { success: false, message: error.message || 'Socket 连接失败' };
    }
  },
  
  // 断开连接
  disconnect({ commit, state }) {
    if (state.socket) {
      state.socket.disconnect();
      commit('SET_SOCKET', null);
      commit('SET_CONNECTED', false);
      commit('RESET_RECONNECT_ATTEMPTS');
      commit('CLEAR_CONNECTION_ERROR');
    }
  },
  
  // 重新连接
  async reconnect({ dispatch, commit, state }) {
    if (state.reconnectAttempts >= state.maxReconnectAttempts) {
      commit('SET_CONNECTION_ERROR', '重连次数已达上限');
      return { success: false, message: '重连次数已达上限' };
    }
    
    commit('INCREMENT_RECONNECT_ATTEMPTS');
    
    // 先断开现有连接
    dispatch('disconnect');
    
    // 等待一段时间后重连
    await new Promise(resolve => setTimeout(resolve, state.reconnectInterval));
    
    return dispatch('connect');
  },
  
  // 设置 Socket 事件监听器
  setupSocketListeners({ commit, dispatch }, socket) {
    // 连接成功
    socket.on('connect', () => {
      console.log('Socket 连接成功');
      commit('SET_CONNECTED', true);
      commit('RESET_RECONNECT_ATTEMPTS');
      commit('CLEAR_CONNECTION_ERROR');
      
      // 更新聊天连接状态
      commit('chat/SET_CONNECTED', true, { root: true });
    });
    
    // 连接断开
    socket.on('disconnect', (reason) => {
      console.log('Socket 连接断开:', reason);
      commit('SET_CONNECTED', false);
      commit('chat/SET_CONNECTED', false, { root: true });
      
      // 如果不是主动断开，尝试重连
      if (reason !== 'io client disconnect') {
        setTimeout(() => {
          dispatch('reconnect');
        }, state.reconnectInterval);
      }
    });
    
    // 连接错误
    socket.on('connect_error', (error) => {
      console.error('Socket 连接错误:', error);
      
      // 检查是否是认证错误
      if (error.message && error.message.includes('认证')) {
        commit('SET_CONNECTION_ERROR', '认证失败');
        
        // 尝试刷新 token
        dispatch('auth/refreshToken', null, { root: true }).then((result) => {
          if (result && result.success) {
            console.log('Token 刷新成功，重新连接 Socket');
            dispatch('reconnect');
          } else {
            console.log('Token 刷新失败，清除登录状态');
            dispatch('auth/logout', null, { root: true });
          }
        });
      } else {
        commit('SET_CONNECTION_ERROR', error.message || 'Socket 连接失败');
      }
      
      commit('SET_CONNECTED', false);
      commit('chat/SET_CONNECTED', false, { root: true });
    });
    
    // 认证错误
    socket.on('auth_error', (error) => {
      console.error('Socket 认证错误:', error);
      commit('SET_CONNECTION_ERROR', '认证失败');
      
      // 认证失败，尝试刷新 token
      dispatch('auth/refreshToken', null, { root: true }).then((result) => {
        if (result && result.success) {
          // Token 刷新成功，重新连接
          console.log('Token 刷新成功，重新连接 Socket');
          dispatch('reconnect');
        } else {
          // Token 刷新失败，清除登录状态
          console.log('Token 刷新失败，清除登录状态');
          dispatch('auth/logout', null, { root: true });
        }
      });
    });
    
    // 新消息
    socket.on('new_message', (message) => {
      commit('chat/ADD_MESSAGE', message, { root: true });
      
      // 如果不是当前房间的消息，增加未读数量
      const currentRoom = rootState.chat.currentRoom;
      if (!currentRoom || currentRoom.id !== message.roomId) {
        commit('chat/INCREMENT_UNREAD_COUNT', null, { root: true });
      }
    });
    
    // 用户上线
    socket.on('user_online', (data) => {
      commit('chat/ADD_ONLINE_USER', data, { root: true });
    });
    
    // 用户离线
    socket.on('user_offline', (data) => {
      commit('chat/REMOVE_ONLINE_USER', data.userId, { root: true });
    });
    
    // 用户加入房间
    socket.on('user_joined_room', (data) => {
      console.log('用户加入房间:', data);
    });
    
    // 用户离开房间
    socket.on('user_left_room', (data) => {
      console.log('用户离开房间:', data);
    });
    
    // 用户开始输入
    socket.on('user_typing_start', (data) => {
      commit('chat/ADD_TYPING_USER', { id: data.userId }, { root: true });
    });
    
    // 用户停止输入
    socket.on('user_typing_stop', (data) => {
      commit('chat/REMOVE_TYPING_USER', data.userId, { root: true });
    });
    
    // 房间更新
    socket.on('room_updated', (data) => {
      commit('chat/UPDATE_CHAT_ROOM', {
        roomId: data.roomId,
        updates: data.updates
      }, { root: true });
    });
    
    // 通用错误
    socket.on('error', (error) => {
      console.error('Socket 错误:', error);
      // 可以在这里显示错误提示
    });
  },
  
  // 发送消息
  sendMessage({ state }, data) {
    if (state.socket && state.connected) {
      state.socket.emit('send_message', data);
      return { success: true };
    } else {
      return { success: false, message: '连接已断开' };
    }
  },
  
  // 加入聊天房间
  joinChatRoom({ state }, roomId) {
    if (state.socket && state.connected) {
      state.socket.emit('join_chat_room', { roomId });
      return { success: true };
    } else {
      return { success: false, message: '连接已断开' };
    }
  },
  
  // 离开聊天房间
  leaveChatRoom({ state }, roomId) {
    if (state.socket && state.connected) {
      state.socket.emit('leave_chat_room', { roomId });
      return { success: true };
    } else {
      return { success: false, message: '连接已断开' };
    }
  },
  
  // 开始输入
  startTyping({ state }, roomId) {
    if (state.socket && state.connected) {
      state.socket.emit('typing_start', { roomId });
    }
  },
  
  // 停止输入
  stopTyping({ state }, roomId) {
    if (state.socket && state.connected) {
      state.socket.emit('typing_stop', { roomId });
    }
  }
};

const getters = {
  // 是否已连接
  isConnected: state => state.connected,
  
  // 获取连接错误
  connectionError: state => state.connectionError,
  
  // 是否正在重连
  isReconnecting: state => state.reconnectAttempts > 0 && state.reconnectAttempts < state.maxReconnectAttempts,
  
  // 是否达到最大重连次数
  maxReconnectReached: state => state.reconnectAttempts >= state.maxReconnectAttempts
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};