import {
  getChatRooms,
  getChatRoomById,
  getChatHistory,
  sendMessage as sendMessageAPI,
  markMessagesAsRead,
  endChat,
  revealIdentity,
  deleteChatRoom
} from '@/api/chat';

const state = {
  // 聊天房间列表
  chatRooms: [],
  
  // 当前聊天房间
  currentRoom: null,
  
  // 当前房间的消息列表
  messages: [],
  
  // 消息加载状态
  messagesLoading: false,
  
  // 是否还有更多消息
  hasMoreMessages: true,
  
  // 未读消息数量
  unreadCount: 0,
  
  // 在线用户列表
  onlineUsers: [],
  
  // 正在输入的用户列表
  typingUsers: [],
  
  // Socket 连接状态
  connected: false,
  
  // 临时消息（发送中的消息）
  tempMessages: []
};

const mutations = {
  // 设置聊天房间列表
  SET_CHAT_ROOMS(state, rooms) {
    state.chatRooms = rooms;
  },
  
  // 添加聊天房间
  ADD_CHAT_ROOM(state, room) {
    const index = state.chatRooms.findIndex(r => r.id === room.id);
    if (index === -1) {
      state.chatRooms.unshift(room);
    } else {
      state.chatRooms.splice(index, 1, room);
    }
  },
  
  // 更新聊天房间
  UPDATE_CHAT_ROOM(state, { roomId, updates }) {
    const index = state.chatRooms.findIndex(r => r.id === roomId);
    if (index !== -1) {
      state.chatRooms.splice(index, 1, {
        ...state.chatRooms[index],
        ...updates
      });
    }
    
    // 如果是当前房间，也更新当前房间
    if (state.currentRoom && state.currentRoom.id === roomId) {
      state.currentRoom = {
        ...state.currentRoom,
        ...updates
      };
    }
  },
  
  // 删除聊天房间
  REMOVE_CHAT_ROOM(state, roomId) {
    const index = state.chatRooms.findIndex(r => r.id === roomId);
    if (index !== -1) {
      state.chatRooms.splice(index, 1);
    }
  },
  
  // 设置当前聊天房间
  SET_CURRENT_ROOM(state, room) {
    state.currentRoom = room;
  },
  
  // 清除当前聊天房间
  CLEAR_CURRENT_ROOM(state) {
    state.currentRoom = null;
    state.messages = [];
    state.hasMoreMessages = true;
  },
  
  // 设置消息列表
  SET_MESSAGES(state, messages) {
    state.messages = messages;
  },
  
  // 添加消息
  ADD_MESSAGE(state, message) {
    // 检查消息是否已存在
    const exists = state.messages.some(m => m.id === message.id);
    if (!exists) {
      state.messages.push(message);
    }
    
    // 移除对应的临时消息
    if (message.tempId) {
      const tempIndex = state.tempMessages.findIndex(m => m.tempId === message.tempId);
      if (tempIndex !== -1) {
        state.tempMessages.splice(tempIndex, 1);
      }
    }
  },
  
  // 添加临时消息
  ADD_TEMP_MESSAGE(state, message) {
    state.tempMessages.push(message);
  },
  
  // 移除临时消息
  REMOVE_TEMP_MESSAGE(state, tempId) {
    const index = state.tempMessages.findIndex(m => m.tempId === tempId);
    if (index !== -1) {
      state.tempMessages.splice(index, 1);
    }
  },
  
  // 批量添加消息（用于加载历史消息）
  PREPEND_MESSAGES(state, messages) {
    state.messages = [...messages, ...state.messages];
  },
  
  // 设置消息加载状态
  SET_MESSAGES_LOADING(state, loading) {
    state.messagesLoading = loading;
  },
  
  // 设置是否还有更多消息
  SET_HAS_MORE_MESSAGES(state, hasMore) {
    state.hasMoreMessages = hasMore;
  },
  
  // 设置未读消息数量
  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count;
  },
  
  // 增加未读消息数量
  INCREMENT_UNREAD_COUNT(state) {
    state.unreadCount += 1;
  },
  
  // 清除未读消息数量
  CLEAR_UNREAD_COUNT(state) {
    state.unreadCount = 0;
  },
  
  // 添加在线用户
  ADD_ONLINE_USER(state, user) {
    const exists = state.onlineUsers.some(u => u.userId === user.userId);
    if (!exists) {
      state.onlineUsers.push(user);
    }
  },
  
  // 移除在线用户
  REMOVE_ONLINE_USER(state, userId) {
    const index = state.onlineUsers.findIndex(u => u.userId === userId);
    if (index !== -1) {
      state.onlineUsers.splice(index, 1);
    }
  },
  
  // 添加正在输入的用户
  ADD_TYPING_USER(state, user) {
    const exists = state.typingUsers.some(u => u.id === user.id);
    if (!exists) {
      state.typingUsers.push(user);
    }
  },
  
  // 移除正在输入的用户
  REMOVE_TYPING_USER(state, userId) {
    const index = state.typingUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      state.typingUsers.splice(index, 1);
    }
  },
  
  // 设置连接状态
  SET_CONNECTED(state, connected) {
    state.connected = connected;
  }
};

const actions = {
  // 获取聊天房间列表
  async fetchChatRooms({ commit }) {
    try {
      const response = await getChatRooms();
      if (response.success) {
        commit('SET_CHAT_ROOMS', response.data || []);
        
        // 计算未读消息总数
        const unreadCount = (response.data || []).reduce((sum, room) => {
          return sum + (room.unreadCount || 0);
        }, 0);
        commit('SET_UNREAD_COUNT', unreadCount);
        
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('获取聊天房间列表失败:', error);
      return { success: false, message: error.message || '获取聊天房间列表失败' };
    }
  },
  
  // 进入聊天房间
  async enterChatRoom({ commit, dispatch }, roomId) {
    try {
      // 获取房间详情
      const response = await getChatRoomById(roomId);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      
      commit('SET_CURRENT_ROOM', response.data);
      
      // 加载聊天历史
      await dispatch('loadChatHistory', roomId);
      
      // 加入 Socket.IO 房间
      dispatch('socket/joinChatRoom', roomId, { root: true });
      
      // 标记消息为已读
      await dispatch('markAsRead', roomId);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('进入聊天房间失败:', error);
      return { success: false, message: error.message || '进入聊天房间失败' };
    }
  },
  
  // 离开聊天房间
  leaveChatRoom({ commit, dispatch, state }) {
    if (state.currentRoom) {
      // 离开 Socket.IO 房间
      dispatch('socket/leaveChatRoom', state.currentRoom.id, { root: true });
      
      // 清除当前房间
      commit('CLEAR_CURRENT_ROOM');
    }
  },
  
  // 加载聊天历史
  async loadChatHistory({ commit, state }, roomId) {
    if (state.messagesLoading) {
      return;
    }
    
    commit('SET_MESSAGES_LOADING', true);
    
    try {
      const params = {
        limit: 50
      };
      
      // 如果已有消息，加载更早的消息
      if (state.messages.length > 0) {
        params.before = state.messages[0].sentAt;
      }
      
      const response = await getChatHistory(roomId, params);
      
      if (response.success) {
        const messages = response.data || [];
        
        if (messages.length === 0) {
          commit('SET_HAS_MORE_MESSAGES', false);
        } else {
          if (state.messages.length === 0) {
            commit('SET_MESSAGES', messages);
          } else {
            commit('PREPEND_MESSAGES', messages);
          }
        }
        
        return { success: true, data: messages };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      return { success: false, message: error.message || '加载聊天历史失败' };
    } finally {
      commit('SET_MESSAGES_LOADING', false);
    }
  },
  
  // 发送消息
  async sendMessage({ commit, dispatch, state, rootState }, { content, type = 'TEXT' }) {
    if (!state.currentRoom) {
      return { success: false, message: '未进入聊天房间' };
    }
    
    // 生成临时ID
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    // 创建临时消息
    const tempMessage = {
      tempId,
      content,
      type,
      senderId: rootState.auth.user?.anonymousId,
      senderName: rootState.auth.user?.displayName || '我',
      sentAt: new Date(),
      roomId: state.currentRoom.id,
      sending: true
    };
    
    // 添加到临时消息列表
    commit('ADD_TEMP_MESSAGE', tempMessage);
    
    // 通过 Socket.IO 发送
    const socketResult = dispatch('socket/sendMessage', {
      roomId: state.currentRoom.id,
      content,
      type,
      tempId
    }, { root: true });
    
    if (socketResult.success) {
      return { success: true, tempId };
    }
    
    // 如果 Socket 不可用，使用 HTTP API
    try {
      const response = await sendMessageAPI(state.currentRoom.id, { content, type });
      
      if (response.success) {
        // 移除临时消息
        commit('REMOVE_TEMP_MESSAGE', tempId);
        
        // 添加真实消息
        commit('ADD_MESSAGE', response.data);
        
        return { success: true, data: response.data };
      }
      
      // 发送失败，移除临时消息
      commit('REMOVE_TEMP_MESSAGE', tempId);
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 移除临时消息
      commit('REMOVE_TEMP_MESSAGE', tempId);
      
      return { success: false, message: error.message || '发送消息失败' };
    }
  },
  
  // 标记消息为已读
  async markAsRead({ commit }, roomId) {
    try {
      await markMessagesAsRead(roomId);
      commit('CLEAR_UNREAD_COUNT');
      return { success: true };
    } catch (error) {
      console.error('标记消息已读失败:', error);
      return { success: false };
    }
  },
  
  // 结束聊天
  async endChat({ commit, state }) {
    if (!state.currentRoom) {
      return { success: false, message: '未进入聊天房间' };
    }
    
    try {
      const response = await endChat(state.currentRoom.id);
      
      if (response.success) {
        // 更新房间状态
        commit('UPDATE_CHAT_ROOM', {
          roomId: state.currentRoom.id,
          updates: { isActive: false }
        });
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('结束聊天失败:', error);
      return { success: false, message: error.message || '结束聊天失败' };
    }
  },
  
  // 身份揭示
  async revealIdentity({ commit, state }) {
    if (!state.currentRoom) {
      return { success: false, message: '未进入聊天房间' };
    }
    
    try {
      const response = await revealIdentity(state.currentRoom.id);
      
      if (response.success) {
        // 更新房间状态
        commit('UPDATE_CHAT_ROOM', {
          roomId: state.currentRoom.id,
          updates: response.data.chatRoom
        });
        
        return { 
          success: true, 
          bothRevealed: response.data.bothRevealed 
        };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('身份揭示失败:', error);
      return { success: false, message: error.message || '身份揭示失败' };
    }
  },
  
  // 删除聊天房间
  async deleteChatRoom({ commit }, roomId) {
    try {
      const response = await deleteChatRoom(roomId);
      
      if (response.success) {
        commit('REMOVE_CHAT_ROOM', roomId);
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('删除聊天房间失败:', error);
      return { success: false, message: error.message || '删除聊天房间失败' };
    }
  }
};

const getters = {
  // 获取所有消息（包括临时消息）
  allMessages: state => {
    return [...state.messages, ...state.tempMessages].sort((a, b) => {
      return new Date(a.sentAt) - new Date(b.sentAt);
    });
  },
  
  // 获取对方用户信息
  otherUser: (state, getters, rootState) => {
    if (!state.currentRoom) {
      return null;
    }
    
    const currentUserId = rootState.auth.user?.anonymousId;
    
    if (state.currentRoom.participant1Id === currentUserId) {
      return state.currentRoom.participant2;
    } else {
      return state.currentRoom.participant1;
    }
  },
  
  // 是否有未读消息
  hasUnread: state => state.unreadCount > 0,
  
  // 是否正在输入
  isTyping: state => state.typingUsers.length > 0
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
