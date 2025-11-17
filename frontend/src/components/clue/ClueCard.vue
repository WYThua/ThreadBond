<template>
  <div class="clue-card" @click="handleCardClick">
    <!-- 线索头部 -->
    <div class="clue-header">
      <div class="creator-info">
        <div class="creator-avatar">
          <img v-if="clue.creator.avatarUrl" :src="clue.creator.avatarUrl" :alt="clue.creator.displayName" />
          <div v-else class="default-avatar">
            <van-icon name="user-o" />
          </div>
        </div>
        <div class="creator-details">
          <span class="creator-name">{{ clue.creator.displayName }}</span>
          <span class="create-time">{{ formatTime(clue.createdAt) }}</span>
        </div>
      </div>
      <div class="clue-difficulty">
        <van-tag :type="getDifficultyType(clue.difficulty)" size="mini">
          {{ getDifficultyText(clue.difficulty) }}
        </van-tag>
      </div>
    </div>

    <!-- 线索内容 -->
    <div class="clue-content">
      <h3 class="clue-title">{{ clue.title }}</h3>
      
      <!-- 根据类型显示不同内容 -->
      <div class="clue-body">
        <!-- 文字类型 -->
        <div v-if="clue.type === 'TEXT' && clue.content.text" class="text-content">
          <p>{{ truncateText(clue.content.text, 100) }}</p>
        </div>
        
        <!-- 图片类型 -->
        <div v-if="clue.type === 'IMAGE' && clue.content.imageUrl" class="image-content">
          <img :src="clue.content.imageUrl" :alt="clue.title" @load="handleImageLoad" />
        </div>
        
        <!-- 音频类型 -->
        <div v-if="clue.type === 'AUDIO' && clue.content.audioUrl" class="audio-content">
          <div class="audio-placeholder">
            <van-icon name="music-o" size="24" />
            <span>音频线索</span>
          </div>
        </div>
        
        <!-- 视频类型 -->
        <div v-if="clue.type === 'VIDEO' && clue.content.videoUrl" class="video-content">
          <div class="video-placeholder">
            <van-icon name="video-o" size="24" />
            <span>视频线索</span>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="clue.tags && clue.tags.length > 0" class="clue-tags">
        <van-tag v-for="tag in clue.tags.slice(0, 3)" :key="tag" plain size="mini">
          {{ tag }}
        </van-tag>
        <span v-if="clue.tags.length > 3" class="more-tags">+{{ clue.tags.length - 3 }}</span>
      </div>
    </div>

    <!-- 线索统计 -->
    <div class="clue-stats">
      <div class="stat-item">
        <van-icon name="eye-o" />
        <span>{{ clue.decryptionCount || 0 }}</span>
      </div>
      <div class="stat-item success">
        <van-icon name="passed" />
        <span>{{ clue.successfulDecryptions || 0 }}</span>
      </div>
      <div class="stat-item">
        <van-icon name="clock-o" />
        <span>{{ getSuccessRate() }}%</span>
      </div>
    </div>

    <!-- 过期提示 -->
    <div v-if="isExpiringSoon" class="expiry-warning">
      <van-icon name="warning-o" />
      <span>即将过期</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClueCard',
  
  props: {
    clue: {
      type: Object,
      required: true
    }
  },

  computed: {
    isExpiringSoon() {
      if (!this.clue.expiresAt) return false;
      const expiryTime = new Date(this.clue.expiresAt);
      const now = new Date();
      const hoursUntilExpiry = (expiryTime - now) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
    }
  },

  methods: {
    handleCardClick() {
      this.$emit('click', this.clue);
    },

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

    getDifficultyType(difficulty) {
      const typeMap = {
        'EASY': 'success',
        'MEDIUM': 'warning',
        'HARD': 'danger'
      };
      return typeMap[difficulty] || 'default';
    },

    getDifficultyText(difficulty) {
      const textMap = {
        'EASY': '简单',
        'MEDIUM': '中等',
        'HARD': '困难'
      };
      return textMap[difficulty] || difficulty;
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    getSuccessRate() {
      const total = this.clue.decryptionCount || 0;
      const success = this.clue.successfulDecryptions || 0;
      if (total === 0) return 0;
      return Math.round((success / total) * 100);
    },

    handleImageLoad(event) {
      event.target.classList.add('loaded');
    }
  }
};
</script>

<style lang="scss" scoped>
.clue-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-color: #1989fa;
  }

  &:active {
    transform: translateY(0);
  }
}

.clue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .creator-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .creator-avatar {
      width: 32px;
      height: 32px;
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

      .default-avatar {
        color: #969799;
      }
    }

    .creator-details {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .creator-name {
        font-size: 14px;
        font-weight: 500;
        color: #323233;
      }

      .create-time {
        font-size: 12px;
        color: #969799;
      }
    }
  }
}

.clue-content {
  .clue-title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin: 0 0 8px;
    line-height: 1.4;
  }

  .clue-body {
    margin-bottom: 12px;

    .text-content {
      p {
        font-size: 14px;
        color: #646566;
        line-height: 1.5;
        margin: 0;
      }
    }

    .image-content {
      img {
        width: 100%;
        max-height: 200px;
        object-fit: cover;
        border-radius: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;

        &.loaded {
          opacity: 1;
        }
      }
    }

    .audio-content,
    .video-content {
      .audio-placeholder,
      .video-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 24px;
        background: #f7f8fa;
        border-radius: 8px;
        color: #969799;

        span {
          font-size: 14px;
        }
      }
    }
  }

  .clue-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;

    .more-tags {
      font-size: 12px;
      color: #969799;
    }
  }
}

.clue-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

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

.expiry-warning {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
  border-radius: 12px;
  font-size: 11px;
}

@media (max-width: 480px) {
  .clue-card {
    padding: 12px;
    margin-bottom: 8px;
  }

  .clue-stats {
    gap: 12px;
  }
}
</style>