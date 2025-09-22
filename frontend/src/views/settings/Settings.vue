<template>
  <div class="settings">
    <van-nav-bar
      title="设置"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />
    
    <div class="settings-content">
      <p>设置功能开发中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings'
};
</script>

<style lang="scss" scoped>
.settings {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.settings-content {
  padding: 20px;
  text-align: center;
  color: #969799;
}
</style>