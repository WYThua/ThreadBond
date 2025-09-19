// 聊天状态管理
const state = {
  // 聊天房间列表
  chatRooms: [],
  
  // 当前聊天房间
  currentRoom: null,
  
  // 当前房间的消息列表
  messages: [],
  
  // 未读消息数量
  unreadCount: 0,
  
  // 在线用户列表
  onlineUsers: [],
  
  // 正在输入的用户
  typingUsers: [],
  
  // 加载状态
  loading: false,
  
  // 发送消息状态
  sending: false,
  
  // 连接状态
  connected: false
};

const mutations = {
  // 设置聊天房间列表
  SET_CHAT_ROOMS(state, rooms) {
    state.chatRooms = rooms;
  },
  
  // 添加聊天房间
  ADD_CHAT_ROOM(state, room) {
    const existingIndex = state.chatRooms.findIndex(r => r.id === room.id);
    if (existingIndex !== -1) {
      state.chatRooms.splice(existingIndex, 1, room);
    } else {
      state.chatRooms.unshift(room);
    }
  },
  
  // 更新聊天房间
  UPDATE_CHAT_ROOM(state, { roomId, updates }) {
    const index = state.chatRooms.findIndex(room => room.id === roomId);
    if (index !== -1) {
      state.chatRooms.splice(index, 1, {
        ...state.chatRooms[index],
        ...updates
      });
    }
    
    // 如果是当前房间，也要更新
    if (state.currentRoom && state.currentRoom.id === roomId) {
      state.currentRoom = { ...state.currentRoom, ...updates };
    }
  },
  
  // 设置当前聊天房间
  SET_CURRENT_ROOM(state, room) {
    state.currentRoom = room;
    // 清空之前的消息
    state.messages = [];
  },
  
  // 设置消息列表
  SET_MESSAGES(state, messages) {
    state.messages = messages;
  },
  
  // 添加消息
  ADD_MESSAGE(state, message) {
    state.messages.push(message);
    
    // 更新房间的最后消息时间
    if (state.currentRoom) {
      state.currentRoom.lastMessageAt = message.sentAt;
    }
  },
  
  // 添加多条消息（用于历史消息加载）
  ADD_MESSAGES(state, messages) {
    state.messages = [...messages, ...state.messages];
  },
  
  // 更新消息状态
  UPDATE_MESSAGE(state, { messageId, updates }) {
    const index = state.messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      state.messages.splice(index, 1, {
        ...state.messages[index],
        ...updates
      });
    }
  },
  
  // 设置未读消息数量
  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count;
  },
  
  // 增加未读消息数量
  INCREMENT_UNREAD_COUNT(state) {
    state.unreadCount += 1;
  },
  
  // 清除特定房间的未读数量
  CLEAR_ROOM_UNREAD(state, roomId) {
    const room = state.chatRooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = 0;
    }
  },
  
  // 设置在线用户
  SET_ONLINE_USERS(state, users) {
    state.onlineUsers = users;
  },
  
  // 添加在线用户
  ADD_ONLINE_USER(state, user) {
    if (!state.onlineUsers.find(u => u.id === user.id)) {
      state.onlineUsers.push(user);
    }
  },
  
  // 移除在线用户
  REMOVE_ONLINE_USER(state, userId) {
    state.onlineUsers = state.onlineUsers.filter(u => u.id !== userId);
  },
  
  // 设置正在输入的用户
  SET_TYPING_USERS(state, users) {
    state.typingUsers = users;
  },
  
  // 添加正在输入的用户
  ADD_TYPING_USER(state, user) {
    if (!state.typingUsers.find(u => u.id === user.id)) {
      state.typingUsers.push(user);
    }
  },
  
  // 移除正在输入的用户
  REMOVE_TYPING_USER(state, userId) {
    state.typingUsers = state.typingUsers.filter(u => u.id !== userId);
  },
  
  // 设置加载状态
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  // 设置发送状态
  SET_SENDING(state, sending) {
    state.sending = sending;
  },
  
  // 设置连接状态
  SET_CONNECTED(state, connected) {
    state.connected = connected;
  },
  
  // 清除聊天数据
  CLEAR_CHAT_DATA(state) {
    state.chatRooms = [];
    state.currentRoom = null;
    state.messages = [];
    state.unreadCount = 0;
    state.onlineUsers = [];
    state.typingUsers = [];
  }
};

const actions = {
  // 获取聊天房间列表
  async fetchChatRooms({ commit }) {
    commit('SET_LOADING', true);
    
    try {
      // 这里应该调用获取聊天房间的 API
      // const response = await api.getChatRooms();
      
      // 暂时使用模拟数据
      const mockRooms = [
        {
          id: 'room-1',
          participant1: {
            id: 'user-1',
            displayName: '神秘探索者',
            avatarUrl: '/avatars/default-1.png'
          },
          participant2: {
            id: 'user-2',
            displayName: '智慧寻宝者',
            avatarUrl: '/avatars/default-2.png'
          },
          clue: {
            id: 'clue-1',
            title: '城市中的秘密花园'
          },
          lastMessage: {
            content: { text: '你好！很高兴认识你' },
            sentAt: new Date().toISOString()
          },
          unreadCount: 2,
          isActive: true,
          identityRevealed: false
        }
      ];
      
      commit('SET_CHAT_ROOMS', mockRooms);
      
      // 计算总未读数量
      const totalUnread = mockRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
      commit('SET_UNREAD_COUNT', totalUnread);
      
      return { success: true };
      
    } catch (error) {
      console.error('获取聊天房间失败:', error);
      return { success: false, message: error.message || '获取聊天房间失败' };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // 获取聊天历史
  async fetchChatHistory({ commit }, { roomId, page = 1, pageSize = 50 }) {
    commit('SET_LOADING', true);
    
    try {
      // 这里应该调用获取聊天历史的 API
      // const response = await api.getChatHistory(roomId, { page, pageSize });
      
      // 暂时使用模拟数据
      const mockMessages = [
        {
          id: 'msg-1',
          content: { text: '你好！很高兴认识你' },
          type: 'TEXT',
          senderId: 'user-2',
          senderName: '智慧寻宝者',
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          readAt: new Date().toISOString()
        },
        {
          id: 'msg-2',
          content: { text: '你好！我也很高兴能和你聊天' },
          type: 'TEXT',
          senderId: 'user-1',
          senderName: '神秘探索者',
          sentAt: new Date(Date.now() - 1800000).toISOString(),
          readAt: new Date().toISOString()
        }
      ];
      
      if (page === 1) {
        commit('SET_MESSAGES', mockMessages);
      } else {
        commit('ADD_MESSAGES', mockMessages);
      }
      
      return { success: true, hasMore: false };
      
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      return { success: false, message: error.message || '获取聊天历史失败' };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // 发送消息
  async sendMessage({ commit, state }, { roomId, content, type = 'TEXT' }) {
    if (!state.connected) {
      return { success: false, message: '连接已断开，请重新连接' };
    }
    
    commit('SET_SENDING', true);
    
    try {
      // 创建临时消息对象
      const tempMessage = {
        id: 'temp-' + Date.now(),
        content,
        type,
        senderId: 'current-user', // 应该从用户状态获取
        senderName: '我',
        sentAt: new Date().toISOString(),
        status: 'sending'
      };
      
      // 立即添加到消息列表
      commit('ADD_MESSAGE', tempMessage);
      
      // 这里应该通过 Socket.IO 发送消息
      // socket.emit('send_message', { roomId, content, type });
      
      // 暂时模拟发送成功
      setTimeout(() => {
        commit('UPDATE_MESSAGE', {
          messageId: tempMessage.id,
          updates: {
            id: 'msg-' + Date.now(),
            status: 'sent'
          }
        });
      }, 1000);
      
      return { success: true };
      
    } catch (error) {
      console.error('发送消息失败:', error);
      return { success: false, message: error.message || '发送消息失败' };
    } finally {
      commit('SET_SENDING', false);
    }
  },
  
  // 加入聊天房间
  async joinChatRoom({ commit }, roomId) {
    try {
      // 这里应该通过 Socket.IO 加入房间
      // socket.emit('join_chat_room', { roomId });
      
      // 清除该房间的未读数量
      commit('CLEAR_ROOM_UNREAD', roomId);
      
      return { success: true };
      
    } catch (error) {
      console.error('加入聊天房间失败:', error);
      return { success: false, message: error.message || '加入聊天房间失败' };
    }
  },
  
  // 离开聊天房间
  async leaveChatRoom({ commit }, roomId) {
    try {
      // 这里应该通过 Socket.IO 离开房间
      // socket.emit('leave_chat_room', { roomId });
      
      return { success: true };
      
    } catch (error) {
      console.error('离开聊天房间失败:', error);
      return { success: false, message: error.message || '离开聊天房间失败' };
    }
  },
  
  // 开始输入
  startTyping({ state }, roomId) {
    if (state.connected) {
      // socket.emit('typing_start', { roomId });
    }
  },
  
  // 停止输入
  stopTyping({ state }, roomId) {
    if (state.connected) {
      // socket.emit('typing_stop', { roomId });
    }
  },
  
  // 刷新未读数量
  async refreshUnreadCount({ commit }) {
    try {
      // 这里应该调用获取未读数量的 API
      // const response = await api.getUnreadCount();
      
      // 暂时使用模拟数据
      commit('SET_UNREAD_COUNT', 0);
      
    } catch (error) {
      console.error('刷新未读数量失败:', error);
    }
  }
};

const getters = {
  // 获取聊天房间列表
  chatRooms: state => state.chatRooms,
  
  // 获取当前聊天房间
  currentRoom: state => state.currentRoom,
  
  // 获取消息列表
  messages: state => state.messages,
  
  // 获取未读消息数量
  unreadCount: state => state.unreadCount,
  
  // 获取在线用户
  onlineUsers: state => state.onlineUsers,
  
  // 获取正在输入的用户
  typingUsers: state => state.typingUsers,
  
  // 是否正在加载
  isLoading: state => state.loading,
  
  // 是否正在发送
  isSending: state => state.sending,
  
  // 是否已连接
  isConnected: state => state.connected,
  
  // 获取特定房间的未读数量
  getRoomUnreadCount: state => roomId => {
    const room = state.chatRooms.find(r => r.id === roomId);
    return room ? room.unreadCount || 0 : 0;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};