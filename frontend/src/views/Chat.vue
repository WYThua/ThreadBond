<template>
  <div class="chat-page">
    <van-nav-bar title="聊天" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="chat-content">
        <!-- 空状态 -->
        <div v-if="!loading && chatRooms.length === 0" class="empty-state">
          <van-empty
            image="chat-o"
            description="暂无聊天记录"
          >
            <van-button
              round
              type="primary"
              size="small"
              @click="goToDiscover"
            >
              去发现线索
            </van-button>
          </van-empty>
        </div>
        
        <!-- 聊天列表 -->
        <van-list
          v-else
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="room in chatRooms"
            :key="room.id"
            class="chat-item"
            @click="enterChatRoom(room.id)"
          >
            <div class="chat-avatar">
              <van-image
                round
                width="48"
                height="48"
                :src="getOtherUserAvatar(room)"
                fit="cover"
              >
                <template v-slot:error>
                  <van-icon name="user-circle-o" size="48" />
                </template>
              </van-image>
              <van-badge
                v-if="room.unreadCount > 0"
                :content="room.unreadCount > 99 ? '99+' : room.unreadCount"
                class="unread-badge"
              />
            </div>
            
            <div class="chat-info">
              <div class="chat-header">
                <span class="chat-name">{{ getOtherUserName(room) }}</span>
                <span class="chat-time">{{ formatTime(room.lastMessageAt) }}</span>
              </div>
              
              <div class="chat-preview">
                <span class="preview-text">{{ getLastMessagePreview(room) }}</span>
                <van-tag
                  v-if="!room.isActive"
                  type="default"
                  size="mini"
                  class="status-tag"
                >
                  已结束
                </van-tag>
                <van-tag
                  v-else-if="room.identityRevealed"
                  type="success"
                  size="mini"
                  class="status-tag"
                >
                  已揭示
                </van-tag>
              </div>
            </div>
          </div>
        </van-list>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export default {
  name: 'Chat',
  
  data() {
    return {
      loading: false,
      refreshing: false,
      finished: true // 暂时不支持分页
    };
  },
  
  computed: {
    ...mapState('chat', ['chatRooms']),
    ...mapState('auth', ['user'])
  },
  
  created() {
    this.loadChatRooms();
  },
  
  methods: {
    ...mapActions('chat', ['fetchChatRooms', 'enterChatRoom']),
    
    // 加载聊天房间列表
    async loadChatRooms() {
      this.loading = true;
      try {
        await this.fetchChatRooms();
      } catch (error) {
        this.$toast.fail('加载聊天列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 下拉刷新
    async onRefresh() {
      await this.loadChatRooms();
      this.refreshing = false;
      this.$toast.success('刷新成功');
    },
    
    // 加载更多（暂不实现）
    onLoad() {
      this.finished = true;
    },
    
    // 进入聊天房间
    async enterChatRoom(roomId) {
      this.$router.push({
        name: 'ChatRoom',
        params: { roomId }
      });
    },
    
    // 获取对方用户头像
    getOtherUserAvatar(room) {
      const otherUser = this.getOtherUser(room);
      return otherUser?.avatarUrl || '';
    },
    
    // 获取对方用户名称
    getOtherUserName(room) {
      const otherUser = this.getOtherUser(room);
      return otherUser?.displayName || '匿名用户';
    },
    
    // 获取对方用户信息
    getOtherUser(room) {
      if (!this.user || !this.user.anonymousId) {
        return null;
      }
      
      if (room.participant1Id === this.user.anonymousId) {
        return room.participant2;
      } else {
        return room.participant1;
      }
    },
    
    // 获取最后一条消息预览
    getLastMessagePreview(room) {
      if (!room.messages || room.messages.length === 0) {
        return '暂无消息';
      }
      
      const lastMessage = room.messages[0];
      
      if (lastMessage.type === 'TEXT') {
        return lastMessage.content.text || '';
      } else if (lastMessage.type === 'IMAGE') {
        return '[图片]';
      } else if (lastMessage.type === 'EMOJI') {
        return lastMessage.content.emoji || '[表情]';
      } else if (lastMessage.type === 'SYSTEM') {
        return lastMessage.content.systemMessage || '[系统消息]';
      }
      
      return '';
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) {
        return '';
      }
      
      try {
        return dayjs(time).fromNow();
      } catch (error) {
        return '';
      }
    },
    
    // 去发现页面
    goToDiscover() {
      this.$router.push({ name: 'Discover' });
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.chat-content {
  min-height: calc(100vh - 46px);
}

.empty-state {
  padding: 80px 20px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #f7f8fa;
  }
  
  .chat-avatar {
    position: relative;
    margin-right: 12px;
    flex-shrink: 0;
    
    .unread-badge {
      position: absolute;
      top: -4px;
      right: -4px;
    }
  }
  
  .chat-info {
    flex: 1;
    min-width: 0;
    
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .chat-name {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .chat-time {
        font-size: 12px;
        color: #969799;
        margin-left: 8px;
        flex-shrink: 0;
      }
    }
    
    .chat-preview {
      display: flex;
      align-items: center;
      
      .preview-text {
        flex: 1;
        font-size: 14px;
        color: #969799;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .status-tag {
        margin-left: 8px;
        flex-shrink: 0;
      }
    }
  }
}
</style>