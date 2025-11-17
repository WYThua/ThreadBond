<template>
  <div class="clue-detail-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="线索详情"
      fixed
      placeholder
    >
      <template #left>
        <div class="custom-back-btn" @click.stop.prevent="goBack" @mousedown="testMouseDown">
          <i class="fas fa-chevron-left"></i>
        </div>
      </template>
      <template #right>
        <van-icon name="share-o" @click="shareClue" />
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>

    <!-- 线索内容 -->
    <div v-else-if="clue" class="clue-content">
      <!-- 线索头部信息 -->
      <div class="clue-header">
        <div class="creator-section">
          <div class="creator-avatar">
            <img v-if="clue.creator && clue.creator.avatarUrl" :src="clue.creator.avatarUrl" :alt="clue.creator.displayName" />
            <van-icon v-else name="user-o" />
          </div>
          <div class="creator-info">
            <h3 class="creator-name">{{ clue.creator ? clue.creator.displayName : '匿名用户' }}</h3>
            <p class="create-time">{{ formatTime(clue.createdAt) }}</p>
          </div>
        </div>
        <div class="clue-meta">
          <van-tag :type="getDifficultyType(clue.difficulty)" size="mini">
            {{ getDifficultyText(clue.difficulty) }}
          </van-tag>
          <van-tag v-if="isExpiringSoon" type="warning" size="mini">
            即将过期
          </van-tag>
        </div>
      </div>

      <!-- 线索标题 -->
      <div class="clue-title-section">
        <h1 class="clue-title">{{ clue.title }}</h1>
        <div class="clue-stats">
          <span class="stat-item">
            <van-icon name="eye-o" />
            {{ clue.decryptionCount || 0 }} 次尝试
          </span>
          <span class="stat-item success">
            <van-icon name="passed" />
            {{ clue.successfulDecryptions || 0 }} 次成功
          </span>
        </div>
      </div>

      <!-- 线索内容区域 -->
      <div class="clue-body">
        <!-- 文字内容 -->
        <div v-if="clue.type === 'TEXT' && clue.content && clue.content.text" class="text-content">
          <div class="content-wrapper">
            <p>{{ clue.content.text }}</p>
          </div>
        </div>

        <!-- 图片内容 -->
        <div v-if="clue.type === 'IMAGE' && clue.content && clue.content.imageUrl" class="image-content">
          <div class="image-wrapper">
            <img 
              :src="clue.content.imageUrl" 
              :alt="clue.title"
              @click="previewImage"
            />
          </div>
        </div>

        <!-- 音频内容 -->
        <div v-if="clue.type === 'AUDIO' && clue.content && clue.content.audioUrl" class="audio-content">
          <div class="audio-player">
            <audio controls :src="clue.content.audioUrl">
              您的浏览器不支持音频播放
            </audio>
          </div>
        </div>

        <!-- 视频内容 -->
        <div v-if="clue.type === 'VIDEO' && clue.content && clue.content.videoUrl" class="video-content">
          <div class="video-player">
            <video controls :src="clue.content.videoUrl">
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="clue.tags && clue.tags.length > 0" class="clue-tags">
        <h4>标签</h4>
        <div class="tags-list">
          <van-tag v-for="tag in clue.tags" :key="tag" plain size="mini">
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <!-- 提示信息 -->
      <div v-if="availableHints.length > 0" class="hints-section">
        <h4>提示</h4>
        <div class="hints-list">
          <div v-for="(hint, index) in availableHints" :key="index" class="hint-item">
            <van-icon name="bulb-o" />
            <span>{{ hint }}</span>
          </div>
        </div>
      </div>

      <!-- 解密区域 -->
      <div class="decrypt-section">
        <h4>解密挑战</h4>
        
        <!-- 已解密成功 -->
        <div v-if="isDecrypted" class="decrypted-state">
          <van-icon name="success" color="#07c160" size="32" />
          <p>恭喜！您已成功解密此线索</p>
          <van-button type="primary" @click="goToChat">
            进入聊天
          </van-button>
        </div>

        <!-- 解密表单 -->
        <div v-else class="decrypt-form">
          <van-field
            v-model="decryptAnswer"
            label="答案"
            placeholder="请输入您的答案"
            :disabled="attemptsRemaining <= 0"
          />
          
          <div class="attempts-info">
            <span v-if="attemptsRemaining > 0">
              剩余尝试次数: {{ attemptsRemaining }}
            </span>
            <span v-else class="no-attempts">
              已达到最大尝试次数
            </span>
          </div>

          <van-button
            type="primary"
            block
            :loading="decrypting"
            :disabled="!decryptAnswer.trim() || attemptsRemaining <= 0"
            @click="attemptDecryption"
          >
            {{ decrypting ? '解密中...' : '提交答案' }}
          </van-button>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <van-empty description="线索不存在或已过期">
        <van-button type="primary" @click="$router.go(-1)">
          返回
        </van-button>
      </van-empty>
    </div>

    <!-- 自定义弹窗 -->
    <div v-if="showCustomDialog" class="custom-dialog-overlay" @click="closeCustomDialog">
      <div class="custom-dialog-box" @click.stop>
        <div class="dialog-icon">
          <i v-if="dialogType === 'success'" class="fas fa-check-circle success-icon"></i>
          <i v-else-if="dialogType === 'error'" class="fas fa-times-circle error-icon"></i>
          <i v-else class="fas fa-exclamation-circle warning-icon"></i>
        </div>
        <h3 class="dialog-title">{{ dialogTitle }}</h3>
        <p class="dialog-message">{{ dialogMessage }}</p>
        <button class="dialog-button" :class="dialogType" @click="handleDialogConfirm">
          {{ dialogButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import clueApi from '@/api/clue';
import { ImagePreview } from 'vant';

export default {
  name: 'ClueDetail',

  data() {
    return {
      loading: true,
      clue: null,
      decryptAnswer: '',
      decrypting: false,
      isDecrypted: false,
      availableHints: [],
      attemptsRemaining: 3,
      chatRoomId: null,
      
      // 自定义弹窗状态
      showCustomDialog: false,
      dialogType: 'success', // success, error, warning
      dialogTitle: '',
      dialogMessage: '',
      dialogButtonText: '确定',
      dialogCallback: null
    };
  },

  computed: {
    clueId() {
      return this.$route.params.id;
    },

    isExpiringSoon() {
      if (!this.clue || !this.clue.expiresAt) return false;
      const expiryTime = new Date(this.clue.expiresAt);
      const now = new Date();
      const hoursUntilExpiry = (expiryTime - now) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
    }
  },

  async mounted() {
    await this.loadClueDetail();
  },

  methods: {
    /**
     * 加载线索详情
     */
    async loadClueDetail() {
      this.loading = true;
      
      try {
        const response = await clueApi.getClueDetail(this.clueId);
        
        if (response.success && response.data) {
          this.clue = response.data;
          
          // 检查是否是自己创建的线索
          if (this.clue.isOwnClue) {
            this.showDialog({
              type: 'warning',
              title: '提示',
              message: '这是你自己创建的线索，不能回答哦',
              buttonText: '我知道了',
              callback: () => {
                // 返回上一页
                this.goBack();
              }
            });
            return;
          }
          
          // 检查是否已解密（这里需要从后端获取用户的解密状态）
          // 暂时使用本地存储模拟
          const decryptedClues = JSON.parse(localStorage.getItem('decryptedClues') || '[]');
          this.isDecrypted = decryptedClues.includes(this.clueId);
          
          if (this.isDecrypted) {
            this.chatRoomId = localStorage.getItem(`chatRoom_${this.clueId}`);
          }
        } else {
          console.error('获取线索详情失败:', response.message);
          this.$toast(response.message || '获取线索详情失败');
          this.clue = null;
        }
        
      } catch (error) {
        console.error('加载线索详情失败:', error);
        this.$toast('加载线索详情失败');
        this.clue = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 尝试解密
     */
    async attemptDecryption() {
      if (!this.decryptAnswer.trim()) {
        this.$toast('请输入答案');
        return;
      }

      this.decrypting = true;

      try {
        const response = await clueApi.attemptDecryption(this.clueId, {
          answer: this.decryptAnswer,
          hintsUsed: this.availableHints.length
        });

        if (response.success) {
          // 解密成功 - 使用自定义弹窗
          const result = response.data;
          
          this.showDialog({
            type: 'success',
            title: '恭喜！',
            message: '解密成功！你已经成功破解了这个线索！',
            buttonText: '太棒了',
            callback: () => {
              this.isDecrypted = true;
              this.chatRoomId = result.chatRoomId;
              
              // 保存到本地存储
              const decryptedClues = JSON.parse(localStorage.getItem('decryptedClues') || '[]');
              if (!decryptedClues.includes(this.clueId)) {
                decryptedClues.push(this.clueId);
                localStorage.setItem('decryptedClues', JSON.stringify(decryptedClues));
              }
              
              if (result.chatRoomId) {
                localStorage.setItem(`chatRoom_${this.clueId}`, result.chatRoomId);
              }
            }
          });
          
        } else {
          // 解密失败 - 使用自定义弹窗显示详细错误信息
          const remainingText = response.attemptsRemaining !== undefined && response.attemptsRemaining > 0
            ? `\n剩余尝试次数：${response.attemptsRemaining}` 
            : response.attemptsRemaining === 0 
            ? '\n已达到最大尝试次数'
            : '';
          
          this.showDialog({
            type: 'error',
            title: '解密失败',
            message: response.message + remainingText,
            buttonText: '我知道了'
          });
          
          // 更新提示和剩余次数
          if (response.hintsAvailable) {
            this.availableHints = response.hintsAvailable;
          }
          if (response.attemptsRemaining !== undefined) {
            this.attemptsRemaining = response.attemptsRemaining;
          }
        }

        this.decryptAnswer = '';

      } catch (error) {
        console.error('解密尝试失败:', error);
        
        // 使用自定义弹窗显示错误信息
        const errorMessage = error.message || '解密失败，请重试';
        this.showDialog({
          type: 'warning',
          title: '错误',
          message: errorMessage,
          buttonText: '确定'
        });
      } finally {
        this.decrypting = false;
      }
    },

    /**
     * 进入聊天
     */
    goToChat() {
      if (this.chatRoomId) {
        this.$router.push(`/chat/room/${this.chatRoomId}`);
      } else {
        this.$toast('聊天房间不存在');
      }
    },

    /**
     * 预览图片
     */
    previewImage() {
      if (this.clue && this.clue.content && this.clue.content.imageUrl) {
        ImagePreview([this.clue.content.imageUrl]);
      }
    },

    
    /**
     * 测试鼠标按下事件
     */
    testMouseDown() {
      console.log('🔥 ClueDetail testMouseDown 被调用了！');
    },

    /**
     * 返回上一页
     */
    goBack() {
      // 检查是否有历史记录可以返回
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        // 如果没有历史记录，返回到发现页面
        this.$router.push('/discover');
      }
    },

    /**
     * 分享线索
     */
    shareClue() {
      if (navigator.share) {
        navigator.share({
          title: this.clue.title,
          text: `来挑战这个线索：${this.clue.title}`,
          url: window.location.href
        });
      } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.$toast('链接已复制到剪贴板');
        });
      }
    },

    /**
     * 转换错误消息为用户友好的提示
     */
    translateErrorMessage(message) {
      // 如果消息已经是中文，直接返回
      if (/[\u4e00-\u9fa5]/.test(message)) {
        return message;
      }

      const errorMap = {
        // 答案错误相关
        'Wrong answer': '答案错误，请再想想',
        'Incorrect answer': '答案不正确，再试一次吧',
        'Invalid answer': '答案格式不对哦',
        'Answer is incorrect': '答案错了，别灰心',
        
        // 自己的线索
        'Cannot decrypt own clue': '这是你自己创建的线索，不能回答哦',
        'You cannot decrypt your own clue': '你不能解密自己发布的线索',
        'Own clue': '这是你自己的线索',
        
        // 已解密
        'Already decrypted': '你已经成功解密过这个线索了',
        'Clue already decrypted': '这个线索你已经破解过啦',
        
        // 次数用完
        'No attempts remaining': '解密次数已用完，换个线索试试吧',
        'Maximum attempts reached': '尝试次数已达上限',
        'Out of attempts': '没有尝试机会了',
        
        // 线索状态
        'Clue not found': '线索不存在或已被删除',
        'Clue expired': '线索已过期，无法解密了',
        'Clue is not active': '线索已被禁用',
        
        // 认证相关
        'User not authenticated': '请先登录后再尝试解密',
        'Authentication required': '需要登录才能解密',
        'Not logged in': '请先登录',
        
        // 网络和服务器
        'Network error': '网络连接失败，请检查网络',
        'Server error': '服务器出了点问题，请稍后重试',
        'Timeout': '请求超时，请重试',
        'Internal server error': '服务器内部错误'
      };

      // 完全匹配
      if (errorMap[message]) {
        return errorMap[message];
      }

      // 关键词匹配
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('wrong') || lowerMessage.includes('incorrect')) {
        return '答案错误，请再想想';
      }
      
      if (lowerMessage.includes('own clue') || lowerMessage.includes('your own')) {
        return '这是你自己创建的线索，不能回答哦';
      }
      
      if (lowerMessage.includes('already') && lowerMessage.includes('decrypt')) {
        return '你已经成功解密过这个线索了';
      }
      
      if (lowerMessage.includes('attempt') && (lowerMessage.includes('remaining') || lowerMessage.includes('reached') || lowerMessage.includes('maximum'))) {
        return '解密次数已用完，换个线索试试吧';
      }
      
      if (lowerMessage.includes('not found') || lowerMessage.includes('not exist')) {
        return '线索不存在或已被删除';
      }
      
      if (lowerMessage.includes('expired')) {
        return '线索已过期，无法解密了';
      }
      
      if (lowerMessage.includes('not active') || lowerMessage.includes('disabled')) {
        return '线索已被禁用';
      }
      
      if (lowerMessage.includes('auth') || lowerMessage.includes('login')) {
        return '请先登录后再尝试解密';
      }
      
      if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
        return '网络连接失败，请检查网络';
      }
      
      if (lowerMessage.includes('timeout')) {
        return '请求超时，请重试';
      }
      
      if (lowerMessage.includes('server') || lowerMessage.includes('internal')) {
        return '服务器出了点问题，请稍后重试';
      }

      // 如果都没匹配到，返回原消息
      return message;
    },

    /**
     * 显示自定义弹窗
     */
    showDialog({ type, title, message, buttonText = '确定', callback = null }) {
      this.dialogType = type;
      this.dialogTitle = title;
      this.dialogMessage = this.translateErrorMessage(message);
      this.dialogButtonText = buttonText;
      this.dialogCallback = callback;
      this.showCustomDialog = true;
    },

    /**
     * 关闭自定义弹窗
     */
    closeCustomDialog() {
      this.showCustomDialog = false;
    },

    /**
     * 处理弹窗确认
     */
    handleDialogConfirm() {
      if (this.dialogCallback) {
        this.dialogCallback();
      }
      this.closeCustomDialog();
    },

    /**
     * 格式化时间
     */
    formatTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return '刚刚';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}小时前`;
      } else if (diffInHours < 24 * 7) {
        return `${Math.floor(diffInHours / 24)}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    },

    /**
     * 获取难度类型
     */
    getDifficultyType(difficulty) {
      const typeMap = {
        'EASY': 'success',
        'MEDIUM': 'warning',
        'HARD': 'danger'
      };
      return typeMap[difficulty] || 'default';
    },

    /**
     * 获取难度文本
     */
    getDifficultyText(difficulty) {
      const textMap = {
        'EASY': '简单',
        'MEDIUM': '中等',
        'HARD': '困难'
      };
      return textMap[difficulty] || difficulty;
    }
  }
};
</script>

<style lang="scss" scoped>
.clue-detail-page {
  min-height: 100vh;
  background: #f7f8fa;

  // 确保导航栏样式正确
  :deep(.van-nav-bar) {
    background: #fff !important;
    border-bottom: 1px solid #ebedf0;
    position: relative !important;
    z-index: 100 !important;
    
    .van-nav-bar__content {
      position: relative !important;
      z-index: 101 !important;
    }
    
    .van-nav-bar__title {
      text-align: center;
      font-weight: 600;
      font-size: 17px;
      color: #323233;
      position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    }
    
    .van-nav-bar__left {
      display: flex !important;
      align-items: center !important;
      padding-left: 16px !important;
      position: relative !important;
      z-index: 999 !important;
      pointer-events: auto !important;
    }
    
    .custom-back-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.3s ease;
      padding: 8px !important;
      border-radius: 50%;
      width: 40px !important;
      height: 40px !important;
      position: relative !important;
      z-index: 1000 !important;
      pointer-events: auto !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border: 2px solid #1989fa !important;
      
      i {
        color: #1989fa !important;
        font-size: 20px !important;
        transition: all 0.3s ease;
        pointer-events: none !important;
      }
      
      &:hover {
        background: rgba(25, 137, 250, 0.2) !important;
        transform: translateX(-2px);
        
        i {
          color: #07c160 !important;
        }
      }
      
      &:active {
        transform: translateX(-1px) scale(0.95);
        background: rgba(25, 137, 250, 0.3) !important;
      }
    }
    
    .van-nav-bar__right {
      .van-icon {
        font-size: 18px;
        color: #646566;
        transition: color 0.3s ease;
        
        &:hover {
          color: #323233;
        }
        
        &:active {
          color: #1989fa;
        }
      }
    }
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.error-state {
  padding: 40px 20px;
}

.clue-content {
  .clue-header {
    background: white;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;

    .creator-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .creator-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        background: #f7f8fa;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .creator-info {
        .creator-name {
          font-size: 16px;
          font-weight: 600;
          color: #323233;
          margin: 0 0 4px;
        }

        .create-time {
          font-size: 12px;
          color: #969799;
          margin: 0;
        }
      }
    }

    .clue-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }
  }

  .clue-title-section {
    background: white;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    .clue-title {
      font-size: 20px;
      font-weight: 700;
      color: #323233;
      margin: 0 0 12px;
      line-height: 1.4;
    }

    .clue-stats {
      display: flex;
      gap: 16px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #969799;

        &.success {
          color: #07c160;
        }
      }
    }
  }

  .clue-body {
    background: white;
    margin-top: 8px;
    padding: 16px;

    .content-wrapper {
      p {
        font-size: 16px;
        line-height: 1.6;
        color: #323233;
        margin: 0;
      }
    }

    .image-wrapper {
      img {
        width: 100%;
        border-radius: 8px;
        cursor: pointer;
      }
    }

    .audio-player,
    .video-player {
      audio,
      video {
        width: 100%;
        border-radius: 8px;
      }
    }
  }

  .clue-tags {
    background: white;
    margin-top: 8px;
    padding: 16px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 12px;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .hints-section {
    background: white;
    margin-top: 8px;
    padding: 16px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 12px;
    }

    .hints-list {
      .hint-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
        background: #fff7e6;
        border-radius: 6px;

        .van-icon {
          color: #ff9500;
          margin-top: 2px;
        }

        span {
          font-size: 14px;
          color: #646566;
          line-height: 1.4;
        }
      }
    }
  }

  .decrypt-section {
    background: white;
    margin-top: 8px;
    padding: 16px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px;
    }

    .decrypted-state {
      text-align: center;
      padding: 20px;

      p {
        font-size: 16px;
        color: #07c160;
        margin: 12px 0 20px;
      }
    }

    .decrypt-form {
      .attempts-info {
        display: flex;
        justify-content: center;
        margin: 8px 0 16px;
        font-size: 12px;
        color: #969799;

        .no-attempts {
          color: #ee0a24;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .clue-content {
    .clue-header {
      padding: 12px;

      .creator-section {
        gap: 8px;

        .creator-avatar {
          width: 40px;
          height: 40px;
        }
      }
    }

    .clue-title-section,
    .clue-body,
    .clue-tags,
    .hints-section,
    .decrypt-section {
      padding: 12px;
    }
  }
}

// 自定义弹窗样式
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;

  .custom-dialog-box {
    background: white;
    border-radius: 16px;
    padding: 32px 24px 24px;
    width: 85%;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
    text-align: center;

    .dialog-icon {
      margin-bottom: 16px;

      i {
        font-size: 56px;
        
        &.success-icon {
          color: #07c160;
        }
        
        &.error-icon {
          color: #ee0a24;
        }
        
        &.warning-icon {
          color: #ff976a;
        }
      }
    }

    .dialog-title {
      font-size: 20px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 12px;
    }

    .dialog-message {
      font-size: 15px;
      color: #646566;
      line-height: 1.6;
      margin: 0 0 24px;
      white-space: pre-line;
    }

    .dialog-button {
      width: 100%;
      height: 44px;
      border: none;
      border-radius: 22px;
      font-size: 16px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.success {
        background: linear-gradient(135deg, #07c160, #06ae56);
        box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(7, 193, 96, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
      
      &.error {
        background: linear-gradient(135deg, #ee0a24, #d9001b);
        box-shadow: 0 4px 12px rgba(238, 10, 36, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(238, 10, 36, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
      
      &.warning {
        background: linear-gradient(135deg, #ff976a, #ff8040);
        box-shadow: 0 4px 12px rgba(255, 151, 106, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 151, 106, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>