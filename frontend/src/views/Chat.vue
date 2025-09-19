<template>
  <div class="chat-page">
    <van-nav-bar title="聊天" />
    
    <div class="chat-content">
      <div class="placeholder-content">
        <van-icon name="chat-o" size="60" color="#969799" />
        <h3>聊天功能</h3>
        <p>聊天功能正在开发中</p>
        <p>敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat'
};
</script>

<style lang="scss" scoped>
.chat-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.chat-content {
  padding: 20px;
}

.placeholder-content {
  text-align: center;
  padding: 80px 20px;
  
  h3 {
    color: #323233;
    font-size: 20px;
    margin: 20px 0 8px;
  }
  
  p {
    color: #969799;
    font-size: 14px;
    margin: 4px 0;
  }
}
</style>