<template>
  <div class="chat-room">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="otherUser ? otherUser.displayName : '聊天室'"
      left-arrow
      @click-left="handleBack"
    >
      <template #right>
        <van-icon name="ellipsis" @click="showActions = true" />
      </template>
    </van-nav-bar>
    
    <!-- 消息列表 -->
    <div ref="messageList" class="message-list" @scroll="handleScroll">
      <!-- 加载更多 -->
      <div v-if="hasMoreMessages && !messagesLoading" class="load-more">
        <van-button
          size="small"
          type="default"
          @click="loadMoreMessages"
        >
          加载更多消息
        </van-button>
      </div>
      
      <van-loading v-if="messagesLoading" class="loading-indicator" />
      
      <!-- 消息项 -->
      <div
        v-for="message in allMessages"
        :key="message.id || message.tempId"
        :class="['message-item', isMyMessage(message) ? 'my-message' : 'other-message']"
      >
        <!-- 系统消息 -->
        <div v-if="message.type === 'SYSTEM'" class="system-message">
          <span>{{ message.content.systemMessage || message.content.text }}</span>
        </div>
        
        <!-- 普通消息 -->
        <template v-else>
          <!-- 对方头像 -->
          <div v-if="!isMyMessage(message)" class="message-avatar">
            <van-image
              round
              width="36"
              height="36"
              :src="otherUser?.avatarUrl"
              fit="cover"
            >
              <template v-slot:error>
                <van-icon name="user-circle-o" size="36" />
              </template>
            </van-image>
          </div>
          
          <!-- 消息内容 -->
          <div class="message-content">
            <!-- 文字消息 -->
            <div v-if="message.type === 'TEXT'" class="text-message">
              {{ message.content.text }}
            </div>
            
            <!-- 图片消息 -->
            <div v-else-if="message.type === 'IMAGE'" class="image-message">
              <van-image
                width="200"
                :src="message.content.imageUrl"
                fit="cover"
                @click="previewImage(message.content.imageUrl)"
              />
            </div>
            
            <!-- 表情消息 -->
            <div v-else-if="message.type === 'EMOJI'" class="emoji-message">
              {{ message.content.emoji }}
            </div>
            
            <!-- 发送状态 -->
            <van-loading v-if="message.sending" size="14" class="sending-indicator" />
          </div>
          
          <!-- 我的头像 -->
          <div v-if="isMyMessage(message)" class="message-avatar">
            <van-image
              round
              width="36"
              height="36"
              :src="user?.avatarUrl"
              fit="cover"
            >
              <template v-slot:error>
                <van-icon name="user-circle-o" size="36" />
              </template>
            </van-image>
          </div>
        </template>
      </div>
      
      <!-- 正在输入提示 -->
      <div v-if="isTyping" class="typing-indicator">
        <span>对方正在输入...</span>
      </div>
    </div>
    
    <!-- 输入框 -->
    <div class="input-bar">
      <van-field
        v-model="messageText"
        type="textarea"
        rows="1"
        autosize
        placeholder="输入消息..."
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @input="handleInput"
      />
      
      <van-button
        type="primary"
        size="small"
        :disabled="!messageText.trim()"
        @click="sendTextMessage"
      >
        发送
      </van-button>
    </div>
    
    <!-- 操作菜单 -->
    <van-action-sheet
      v-model="showActions"
      :actions="actions"
      cancel-text="取消"
      @select="onActionSelect"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { ImagePreview } from 'vant';

export default {
  name: 'ChatRoom',
  
  data() {
    return {
      messageText: '',
      showActions: false,
      typingTimer: null,
      isInputFocused: false
    };
  },
  
  computed: {
    ...mapState('chat', [
      'currentRoom',
      'messages',
      'messagesLoading',
      'hasMoreMessages',
      'typingUsers'
    ]),
    ...mapState('auth', ['user']),
    ...mapGetters('chat', ['allMessages', 'otherUser', 'isTyping']),
    
    roomId() {
      return this.$route.params.roomId;
    },
    
    actions() {
      const actions = [];
      
      if (this.currentRoom && this.currentRoom.isActive) {
        if (!this.currentRoom.identityRevealed) {
          actions.push({
            name: '揭示身份',
            color: '#07c160'
          });
        }
        
        actions.push({
          name: '结束聊天',
          color: '#ee0a24'
        });
      }
      
      return actions;
    }
  },
  
  async created() {
    await this.loadChatRoom();
  },
  
  beforeDestroy() {
    this.leaveChatRoom();
    
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  },
  
  methods: {
    ...mapActions('chat', [
      'enterChatRoom',
      'leaveChatRoom',
      'sendMessage',
      'loadChatHistory',
      'endChat',
      'revealIdentity'
    ]),
    ...mapActions('socket', ['startTyping', 'stopTyping']),
    
    // 加载聊天房间
    async loadChatRoom() {
      const result = await this.enterChatRoom(this.roomId);
      
      if (!result.success) {
        this.$toast.fail(result.message || '加载聊天室失败');
        this.$router.back();
        return;
      }
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 加载更多消息
    async loadMoreMessages() {
      await this.loadChatHistory(this.roomId);
    },
    
    // 发送文字消息
    async sendTextMessage() {
      if (!this.messageText.trim()) {
        return;
      }
      
      const text = this.messageText.trim();
      this.messageText = '';
      
      // 停止输入状态
      this.stopTyping(this.roomId);
      
      const result = await this.sendMessage({
        content: { text },
        type: 'TEXT'
      });
      
      if (!result.success) {
        this.$toast.fail(result.message || '发送失败');
        this.messageText = text; // 恢复消息
      } else {
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    // 处理输入
    handleInput() {
      // 发送正在输入状态
      if (this.messageText.trim()) {
        this.startTyping(this.roomId);
        
        // 3秒后自动停止输入状态
        if (this.typingTimer) {
          clearTimeout(this.typingTimer);
        }
        
        this.typingTimer = setTimeout(() => {
          this.stopTyping(this.roomId);
        }, 3000);
      } else {
        this.stopTyping(this.roomId);
      }
    },
    
    // 输入框获得焦点
    handleInputFocus() {
      this.isInputFocused = true;
      
      // 滚动到底部
      setTimeout(() => {
        this.scrollToBottom();
      }, 300);
    },
    
    // 输入框失去焦点
    handleInputBlur() {
      this.isInputFocused = false;
      this.stopTyping(this.roomId);
    },
    
    // 滚动事件
    handleScroll(e) {
      const { scrollTop } = e.target;
      
      // 滚动到顶部时加载更多
      if (scrollTop === 0 && this.hasMoreMessages && !this.messagesLoading) {
        this.loadMoreMessages();
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      const messageList = this.$refs.messageList;
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    },
    
    // 判断是否是我的消息
    isMyMessage(message) {
      return message.senderId === this.user?.anonymousId;
    },
    
    // 预览图片
    previewImage(imageUrl) {
      ImagePreview([imageUrl]);
    },
    
    // 操作菜单选择
    async onActionSelect(action) {
      if (action.name === '揭示身份') {
        await this.handleRevealIdentity();
      } else if (action.name === '结束聊天') {
        await this.handleEndChat();
      }
    },
    
    // 揭示身份
    async handleRevealIdentity() {
      this.$dialog.confirm({
        title: '揭示身份',
        message: '确定要揭示你的真实身份吗？需要双方都同意才能看到对方的真实信息。'
      }).then(async () => {
        const result = await this.revealIdentity();
        
        if (result.success) {
          if (result.bothRevealed) {
            this.$toast.success('双方已同意揭示身份');
          } else {
            this.$toast.success('已记录你的意愿，等待对方确认');
          }
        } else {
          this.$toast.fail(result.message || '操作失败');
        }
      }).catch(() => {
        // 取消
      });
    },
    
    // 结束聊天
    async handleEndChat() {
      this.$dialog.confirm({
        title: '结束聊天',
        message: '确定要结束这个聊天吗？结束后将无法继续发送消息。'
      }).then(async () => {
        const result = await this.endChat();
        
        if (result.success) {
          this.$toast.success('聊天已结束');
          this.$router.back();
        } else {
          this.$toast.fail(result.message || '操作失败');
        }
      }).catch(() => {
        // 取消
      });
    },
    
    // 返回
    handleBack() {
      this.leaveChatRoom();
      this.$router.back();
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f8fa;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  -webkit-overflow-scrolling: touch;
}

.load-more {
  text-align: center;
  padding: 12px 0;
}

.loading-indicator {
  text-align: center;
  padding: 12px 0;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  
  &.my-message {
    justify-content: flex-end;
    
    .message-content {
      background-color: #07c160;
      color: #fff;
      margin-left: 8px;
    }
  }
  
  &.other-message {
    justify-content: flex-start;
    
    .message-content {
      background-color: #fff;
      color: #323233;
      margin-right: 8px;
    }
  }
}

.system-message {
  text-align: center;
  color: #969799;
  font-size: 12px;
  padding: 8px 0;
  margin: 8px 0;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 8px;
  word-break: break-word;
  position: relative;
  
  .text-message {
    font-size: 15px;
    line-height: 1.5;
  }
  
  .image-message {
    padding: 0;
    background: transparent;
  }
  
  .emoji-message {
    font-size: 48px;
    padding: 4px;
  }
  
  .sending-indicator {
    position: absolute;
    bottom: -20px;
    right: 0;
  }
}

.typing-indicator {
  text-align: center;
  color: #969799;
  font-size: 12px;
  padding: 8px 0;
  animation: fade-in-out 1.5s infinite;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.input-bar {
  display: flex;
  align-items: flex-end;
  padding: 8px 12px;
  background-color: #fff;
  border-top: 1px solid #ebedf0;
  
  .van-field {
    flex: 1;
    margin-right: 8px;
    background-color: #f7f8fa;
    border-radius: 4px;
  }
  
  .van-button {
    flex-shrink: 0;
  }
}
</style>