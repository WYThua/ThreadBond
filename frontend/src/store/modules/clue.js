// 线索状态管理
const state = {
  // 线索列表
  clues: [],
  
  // 当前线索
  currentClue: null,
  
  // 我创建的线索
  myClues: [],
  
  // 推荐线索
  recommendedClues: [],
  
  // 热门线索
  trendingClues: [],
  
  // 加载状态
  loading: false,
  
  // 创建状态
  creating: false,
  
  // 解密状态
  decrypting: false,
  
  // 分页信息
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  }
};

const mutations = {
  // 设置线索列表
  SET_CLUES(state, clues) {
    state.clues = clues;
  },
  
  // 添加线索到列表
  ADD_CLUES(state, clues) {
    state.clues = [...state.clues, ...clues];
  },
  
  // 设置当前线索
  SET_CURRENT_CLUE(state, clue) {
    state.currentClue = clue;
  },
  
  // 设置我的线索
  SET_MY_CLUES(state, clues) {
    state.myClues = clues;
  },
  
  // 设置推荐线索
  SET_RECOMMENDED_CLUES(state, clues) {
    state.recommendedClues = clues;
  },
  
  // 设置热门线索
  SET_TRENDING_CLUES(state, clues) {
    state.trendingClues = clues;
  },
  
  // 添加新线索
  ADD_CLUE(state, clue) {
    state.clues.unshift(clue);
    state.myClues.unshift(clue);
  },
  
  // 更新线索
  UPDATE_CLUE(state, { id, updates }) {
    // 更新主列表
    const index = state.clues.findIndex(clue => clue.id === id);
    if (index !== -1) {
      state.clues.splice(index, 1, { ...state.clues[index], ...updates });
    }
    
    // 更新我的线索列表
    const myIndex = state.myClues.findIndex(clue => clue.id === id);
    if (myIndex !== -1) {
      state.myClues.splice(myIndex, 1, { ...state.myClues[myIndex], ...updates });
    }
    
    // 更新当前线索
    if (state.currentClue && state.currentClue.id === id) {
      state.currentClue = { ...state.currentClue, ...updates };
    }
  },
  
  // 删除线索
  REMOVE_CLUE(state, id) {
    state.clues = state.clues.filter(clue => clue.id !== id);
    state.myClues = state.myClues.filter(clue => clue.id !== id);
    
    if (state.currentClue && state.currentClue.id === id) {
      state.currentClue = null;
    }
  },
  
  // 设置加载状态
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  // 设置创建状态
  SET_CREATING(state, creating) {
    state.creating = creating;
  },
  
  // 设置解密状态
  SET_DECRYPTING(state, decrypting) {
    state.decrypting = decrypting;
  },
  
  // 设置分页信息
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  
  // 重置分页
  RESET_PAGINATION(state) {
    state.pagination = {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    };
  }
};

const actions = {
  // 获取线索列表
  async fetchClues({ commit, state }, { refresh = false } = {}) {
    if (refresh) {
      commit('RESET_PAGINATION');
      commit('SET_CLUES', []);
    }
    
    commit('SET_LOADING', true);
    
    try {
      // 这里应该调用获取线索列表的 API
      // const response = await api.getClues({
      //   page: state.pagination.page,
      //   pageSize: state.pagination.pageSize
      // });
      
      // 暂时使用模拟数据
      const mockClues = [
        {
          id: 'clue-1',
          title: '城市中的秘密花园',
          content: {
            text: '在钢筋水泥的丛林中，有一处被遗忘的绿洲...',
            imageUrl: null
          },
          type: 'TEXT',
          difficulty: 'MEDIUM',
          tags: ['城市', '自然', '秘密'],
          createdAt: new Date().toISOString(),
          decryptionCount: 15,
          successfulDecryptions: 3
        }
      ];
      
      if (refresh) {
        commit('SET_CLUES', mockClues);
      } else {
        commit('ADD_CLUES', mockClues);
      }
      
      commit('SET_PAGINATION', {
        page: state.pagination.page + 1,
        total: 50,
        hasMore: mockClues.length === state.pagination.pageSize
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('获取线索列表失败:', error);
      return { success: false, message: error.message || '获取线索列表失败' };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // 获取线索详情
  async fetchClueDetail({ commit }, id) {
    commit('SET_LOADING', true);
    
    try {
      // 这里应该调用获取线索详情的 API
      // const response = await api.getClueDetail(id);
      
      // 暂时使用模拟数据
      const mockClue = {
        id: id,
        title: '城市中的秘密花园',
        content: {
          text: '在钢筋水泥的丛林中，有一处被遗忘的绿洲。它藏在两栋高楼之间，只有在特定的时间，阳光才能洒进这个小小的世界...',
          imageUrl: null
        },
        type: 'TEXT',
        difficulty: 'MEDIUM',
        hints: ['抬头看看', '阳光的角度很重要', '在城市的制高点'],
        tags: ['城市', '自然', '秘密'],
        createdAt: new Date().toISOString(),
        decryptionCount: 15,
        successfulDecryptions: 3,
        creator: {
          displayName: '神秘探索者',
          avatarUrl: '/avatars/default-1.png'
        }
      };
      
      commit('SET_CURRENT_CLUE', mockClue);
      return { success: true, data: mockClue };
      
    } catch (error) {
      console.error('获取线索详情失败:', error);
      return { success: false, message: error.message || '获取线索详情失败' };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // 创建线索
  async createClue({ commit }, clueData) {
    commit('SET_CREATING', true);
    
    try {
      // 这里应该调用创建线索的 API
      // const response = await api.createClue(clueData);
      
      // 暂时使用模拟数据
      const newClue = {
        id: 'clue-' + Date.now(),
        ...clueData,
        createdAt: new Date().toISOString(),
        decryptionCount: 0,
        successfulDecryptions: 0
      };
      
      commit('ADD_CLUE', newClue);
      return { success: true, data: newClue, message: '线索创建成功' };
      
    } catch (error) {
      console.error('创建线索失败:', error);
      return { success: false, message: error.message || '创建线索失败' };
    } finally {
      commit('SET_CREATING', false);
    }
  },
  
  // 尝试解密线索
  async decryptClue({ commit }, { clueId, answer }) {
    commit('SET_DECRYPTING', true);
    
    try {
      // 这里应该调用解密线索的 API
      // const response = await api.decryptClue(clueId, answer);
      
      // 暂时模拟解密结果
      const isCorrect = answer.toLowerCase().includes('天台') || answer.toLowerCase().includes('花园');
      
      if (isCorrect) {
        // 解密成功，可能会创建聊天房间
        return {
          success: true,
          isCorrect: true,
          message: '解密成功！正在为您创建聊天房间...',
          chatRoomId: 'room-' + Date.now()
        };
      } else {
        return {
          success: true,
          isCorrect: false,
          message: '答案不正确，请再试试',
          remainingAttempts: 2
        };
      }
      
    } catch (error) {
      console.error('解密线索失败:', error);
      return { success: false, message: error.message || '解密线索失败' };
    } finally {
      commit('SET_DECRYPTING', false);
    }
  },
  
  // 获取推荐线索
  async fetchRecommendedClues({ commit }) {
    try {
      // 这里应该调用获取推荐线索的 API
      // const response = await api.getRecommendedClues();
      
      // 暂时使用模拟数据
      const mockClues = [
        {
          id: 'rec-clue-1',
          title: '午夜的咖啡香',
          type: 'TEXT',
          difficulty: 'EASY',
          tags: ['咖啡', '夜晚', '温暖']
        }
      ];
      
      commit('SET_RECOMMENDED_CLUES', mockClues);
      return { success: true };
      
    } catch (error) {
      console.error('获取推荐线索失败:', error);
      return { success: false, message: error.message || '获取推荐线索失败' };
    }
  }
};

const getters = {
  // 获取线索列表
  clues: state => state.clues,
  
  // 获取当前线索
  currentClue: state => state.currentClue,
  
  // 获取我的线索
  myClues: state => state.myClues,
  
  // 获取推荐线索
  recommendedClues: state => state.recommendedClues,
  
  // 获取热门线索
  trendingClues: state => state.trendingClues,
  
  // 是否正在加载
  isLoading: state => state.loading,
  
  // 是否正在创建
  isCreating: state => state.creating,
  
  // 是否正在解密
  isDecrypting: state => state.decrypting,
  
  // 分页信息
  pagination: state => state.pagination,
  
  // 是否还有更多数据
  hasMore: state => state.pagination.hasMore
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};