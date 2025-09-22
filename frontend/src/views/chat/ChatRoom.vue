<template>
  <div class="chat-room">
    <van-nav-bar
      title="聊天室"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />
    
    <div class="chat-content">
      <p>聊天室功能开发中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatRoom'
};
</script>

<style lang="scss" scoped>
.chat-room {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.chat-content {
  padding: 20px;
  text-align: center;
  color: #969799;
}
</style>