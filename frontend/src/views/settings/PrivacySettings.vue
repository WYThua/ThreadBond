<template>
  <div class="privacy-settings">
    <van-nav-bar
      title="隐私设置"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />
    
    <div class="privacy-content">
      <p>隐私设置功能开发中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacySettings'
};
</script>

<style lang="scss" scoped>
.privacy-settings {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.privacy-content {
  padding: 20px;
  text-align: center;
  color: #969799;
}
</style>