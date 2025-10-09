<template>
  <div class="home-page">
    <!-- 自定义导航栏 -->
    <div class="custom-nav">
      <div class="nav-content">
        <div class="nav-left">
          <div class="user-avatar">
            <van-icon name="user-circle-o" size="28" color="#1989fa" />
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ anonymousName }}</h3>
            <p class="user-status">在线</p>
          </div>
        </div>
        <div class="nav-right">
          <van-icon name="search" size="20" color="#323233" />
        </div>
      </div>
    </div>
    
    <div class="home-content">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <div class="banner-bg">
          <div class="banner-content">
            <h2 class="banner-title">欢迎来到 ThreadBond</h2>
            <p class="banner-subtitle">开始您的匿名社交之旅</p>
            <van-button 
              type="primary" 
              size="small" 
              round 
              @click="startExploring"
              class="explore-btn"
            >
              开始探索
            </van-button>
          </div>
          <div class="banner-decoration">
            <van-icon name="chat-o" size="60" color="rgba(255,255,255,0.2)" />
          </div>
        </div>
      </div>

      <!-- 功能卡片 -->
      <div class="feature-grid">
        <div class="feature-card" @click="goToCreate">
          <div class="card-icon create">
            <van-icon name="plus" size="24" color="#ffffff" />
          </div>
          <h4 class="card-title">创建线索</h4>
          <p class="card-desc">设计有趣的谜题</p>
        </div>

        <div class="feature-card" @click="goToDiscover">
          <div class="card-icon discover">
            <van-icon name="search" size="24" color="#ffffff" />
          </div>
          <h4 class="card-title">发现线索</h4>
          <p class="card-desc">解密他人的谜题</p>
        </div>

        <div class="feature-card" @click="goToChat">
          <div class="card-icon chat">
            <van-icon name="chat-o" size="24" color="#ffffff" />
          </div>
          <h4 class="card-title">匿名聊天</h4>
          <p class="card-desc">与解密者对话</p>
        </div>

        <div class="feature-card" @click="goToProfile">
          <div class="card-icon profile">
            <van-icon name="user-o" size="24" color="#ffffff" />
          </div>
          <h4 class="card-title">个人中心</h4>
          <p class="card-desc">管理您的身份</p>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="recent-section">
        <div class="section-header">
          <h3 class="section-title">最近活动</h3>
          <span class="section-more">查看全部</span>
        </div>
        
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">
              <van-icon name="star-o" size="16" color="#1989fa" />
            </div>
            <div class="activity-content">
              <p class="activity-title">欢迎加入 ThreadBond！</p>
              <p class="activity-time">刚刚</p>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">
              <van-icon name="shield-o" size="16" color="#07c160" />
            </div>
            <div class="activity-content">
              <p class="activity-title">您的匿名身份已生成</p>
              <p class="activity-time">1分钟前</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <div class="section-header">
          <h3 class="section-title">系统状态</h3>
          <van-tag type="success" size="mini">运行正常</van-tag>
        </div>
        
        <van-grid :column-num="2" :border="false" class="status-grid">
          <van-grid-item>
            <div class="status-item">
              <van-icon name="checked" color="#07c160" size="20" />
              <span class="status-text">后端服务</span>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="status-item">
              <van-icon name="checked" color="#07c160" size="20" />
              <span class="status-text">数据库</span>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="status-item">
              <van-icon name="checked" color="#07c160" size="20" />
              <span class="status-text">实时通信</span>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="status-item">
              <van-icon name="checked" color="#07c160" size="20" />
              <span class="status-text">安全系统</span>
            </div>
          </van-grid-item>
        </van-grid>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Home',
  
  computed: {
    ...mapGetters('user', ['currentAnonymousIdentity']),
    
    anonymousName() {
      return this.currentAnonymousIdentity?.displayName || '神秘旅行者';
    }
  },

  methods: {
    startExploring() {
      this.$router.push('/discover');
    },

    goToCreate() {
      this.$router.push('/create');
    },

    goToDiscover() {
      this.$router.push('/discover');
    },

    goToChat() {
      this.$router.push('/chat');
    },

    goToProfile() {
      this.$router.push('/profile');
    }
  },
  
  mounted() {
    console.log('首页已加载 - ThreadBond 匿名社交平台');
  }
};
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
}

.custom-nav {
  background: white;
  padding: 12px 20px;
  border-bottom: 1px solid #ebedf0;
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-left {
    display: flex;
    align-items: center;

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1989fa 0%, #1976d2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .user-info {
      .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin: 0 0 2px;
      }

      .user-status {
        font-size: 12px;
        color: #07c160;
        margin: 0;
      }
    }
  }

  .nav-right {
    width: 36px;
    height: 36px;
    background: #f7f8fa;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:active {
      background: #ebedf0;
    }
  }
}

.home-content {
  padding: 0 20px 20px;
}

.welcome-banner {
  margin: 20px 0 24px;

  .banner-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 24px;
    position: relative;
    overflow: hidden;
    color: white;

    .banner-content {
      position: relative;
      z-index: 2;

      .banner-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 8px;
      }

      .banner-subtitle {
        font-size: 14px;
        opacity: 0.9;
        margin: 0 0 16px;
        line-height: 1.4;
      }

      .explore-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        backdrop-filter: blur(10px);
      }
    }

    .banner-decoration {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;

  .feature-card {
    background: white;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;

      &.create {
        background: linear-gradient(135deg, #1989fa 0%, #1976d2 100%);
      }

      &.discover {
        background: linear-gradient(135deg, #07c160 0%, #4caf50 100%);
      }

      &.chat {
        background: linear-gradient(135deg, #ff976a 0%, #ffa726 100%);
      }

      &.profile {
        background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
      }
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 4px;
    }

    .card-desc {
      font-size: 12px;
      color: #969799;
      margin: 0;
    }
  }
}

.recent-section,
.system-status {
  margin-bottom: 24px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin: 0;
    }

    .section-more {
      font-size: 12px;
      color: #1989fa;
      cursor: pointer;
    }
  }
}

.activity-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;

  .activity-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      background: #f7f8fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;

      .activity-title {
        font-size: 14px;
        color: #323233;
        margin: 0 0 4px;
      }

      .activity-time {
        font-size: 12px;
        color: #969799;
        margin: 0;
      }
    }
  }
}

.status-grid {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;

    .status-text {
      font-size: 12px;
      color: #646566;
      margin-top: 8px;
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .home-content {
    padding: 0 16px 16px;
  }

  .custom-nav {
    padding: 12px 16px;
  }

  .feature-grid {
    gap: 8px;

    .feature-card {
      padding: 16px 12px;

      .card-icon {
        width: 40px;
        height: 40px;
      }
    }
  }
}
</style>