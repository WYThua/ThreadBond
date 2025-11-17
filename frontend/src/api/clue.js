import api from './index';

/**
 * 线索相关 API
 */
export default {
  /**
   * 创建线索
   * @param {Object} clueData - 线索数据
   * @param {string} clueData.title - 线索标题
   * @param {Object} clueData.content - 线索内容
   * @param {string} clueData.type - 线索类型 (TEXT, IMAGE, AUDIO, VIDEO)
   * @param {string} clueData.difficulty - 难度级别 (EASY, MEDIUM, HARD)
   * @param {string} clueData.solution - 解密答案
   * @param {Array} clueData.hints - 提示数组
   * @param {Array} clueData.tags - 标签数组
   * @param {Date} clueData.expiresAt - 过期时间
   */
  async createClue(clueData) {
    try {
      const response = await api.post('/clues', clueData);
      return {
        success: true,
        data: response.data,
        message: response.message || '线索创建成功'
      };
    } catch (error) {
      console.error('创建线索失败:', error);
      return {
        success: false,
        message: error.message || '创建线索失败'
      };
    }
  },

  /**
   * 获取线索列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.type - 线索类型
   * @param {string} params.difficulty - 难度级别
   * @param {Array} params.tags - 标签筛选
   * @param {string} params.search - 搜索关键词
   * @param {string} params.creatorId - 创建者ID
   */
  async getClues(params = {}) {
    try {
      const response = await api.get('/clues', { params });
      return {
        success: true,
        data: response.data,
        message: response.message || '获取线索列表成功'
      };
    } catch (error) {
      console.error('获取线索列表失败:', error);
      return {
        success: false,
        message: error.message || '获取线索列表失败'
      };
    }
  },

  /**
   * 获取线索详情
   * @param {string} clueId - 线索ID
   */
  async getClueById(clueId) {
    try {
      const response = await api.get(`/clues/${clueId}`);
      return {
        success: true,
        data: response.data,
        message: response.message || '获取线索详情成功'
      };
    } catch (error) {
      console.error('获取线索详情失败:', error);
      return {
        success: false,
        message: error.message || '获取线索详情失败'
      };
    }
  },

  /**
   * 尝试解密线索
   * @param {string} clueId - 线索ID
   * @param {Object} attemptData - 解密数据
   * @param {string} attemptData.answer - 解密答案
   * @param {number} attemptData.hintsUsed - 使用的提示数量
   */
  async attemptDecryption(clueId, attemptData) {
    try {
      const response = await api.post(`/clues/${clueId}/decrypt`, attemptData);
      return {
        success: true,
        data: response.data,
        message: response.message || '解密尝试完成'
      };
    } catch (error) {
      console.error('解密尝试失败:', error);
      
      // 尝试从原始错误响应中提取详细信息
      let errorData = {};
      if (error.originalError && error.originalError.response && error.originalError.response.data) {
        errorData = error.originalError.response.data;
      }
      
      return {
        success: false,
        message: error.message || '解密尝试失败',
        attemptsRemaining: errorData.attemptsRemaining,
        hintsAvailable: errorData.hintsAvailable,
        data: errorData
      };
    }
  },

  /**
   * 更新线索
   * @param {string} clueId - 线索ID
   * @param {Object} updateData - 更新数据
   */
  async updateClue(clueId, updateData) {
    try {
      const response = await api.put(`/clues/${clueId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: response.message || '线索更新成功'
      };
    } catch (error) {
      console.error('更新线索失败:', error);
      return {
        success: false,
        message: error.message || '更新线索失败'
      };
    }
  },

  /**
   * 删除线索
   * @param {string} clueId - 线索ID
   */
  async deleteClue(clueId) {
    try {
      const response = await api.delete(`/clues/${clueId}`);
      return {
        success: true,
        message: response.message || '线索删除成功'
      };
    } catch (error) {
      console.error('删除线索失败:', error);
      return {
        success: false,
        message: error.message || '删除线索失败'
      };
    }
  },

  /**
   * 获取线索池（发现页面）
   * @param {Object} params - 查询参数
   */
  async getCluePool(params = {}) {
    try {
      const response = await api.get('/clues/pool', { params });
      return {
        success: true,
        data: response.data,
        message: response.message || '获取线索池成功'
      };
    } catch (error) {
      console.error('获取线索池失败:', error);
      return {
        success: false,
        message: error.message || '获取线索池失败'
      };
    }
  },

  /**
   * 获取热门线索
   * @param {Object} params - 查询参数
   */
  async getTrendingClues(params = {}) {
    try {
      const response = await api.get('/clues/trending', { params });
      return {
        success: true,
        data: response.data,
        message: response.message || '获取热门线索成功'
      };
    } catch (error) {
      console.error('获取热门线索失败:', error);
      return {
        success: false,
        message: error.message || '获取热门线索失败'
      };
    }
  },

  /**
   * 获取线索分类和标签统计
   */
  async getClueCategories() {
    try {
      const response = await api.get('/clues/categories');
      return {
        success: true,
        data: response.data,
        message: response.message || '获取线索分类成功'
      };
    } catch (error) {
      console.error('获取线索分类失败:', error);
      return {
        success: false,
        message: error.message || '获取线索分类失败'
      };
    }
  },

  /**
   * 搜索线索
   * @param {Object} params - 搜索参数
   */
  async searchClues(params = {}) {
    try {
      const response = await api.get('/clues/search', { params });
      return {
        success: true,
        data: response.data,
        message: response.message || '搜索线索成功'
      };
    } catch (error) {
      console.error('搜索线索失败:', error);
      return {
        success: false,
        message: error.message || '搜索线索失败'
      };
    }
  },

  /**
   * 获取线索详情
   * @param {string} id - 线索ID
   */
  getClueDetail(id) {
    return this.getClueById(id);
  },

  /**
   * 获取用户解密统计
   */
  async getDecryptionStats() {
    try {
      const response = await api.get('/clues/stats/decryption');
      return {
        success: true,
        data: response.data,
        message: response.message || '获取解密统计成功'
      };
    } catch (error) {
      console.error('获取解密统计失败:', error);
      return {
        success: false,
        message: error.message || '获取解密统计失败'
      };
    }
  }
};