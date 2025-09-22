<template>
  <div class="not-found">
    <van-nav-bar
      title="页面未找到"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />
    
    <div class="not-found-content">
      <van-icon name="warning-o" size="60" color="#ee0a24" />
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在</p>
      <van-button type="primary" @click="goHome">返回首页</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.not-found-content {
  padding: 60px 20px;
  text-align: center;
  
  h2 {
    margin: 20px 0 10px;
    color: #323233;
    font-size: 20px;
  }
  
  p {
    margin: 0 0 30px;
    color: #969799;
    font-size: 14px;
  }
}
</style>