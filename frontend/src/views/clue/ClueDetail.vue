<template>
  <div class="clue-detail">
    <van-nav-bar
      title="线索详情"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />
    
    <div class="clue-content">
      <p>线索详情功能开发中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClueDetail'
};
</script>

<style lang="scss" scoped>
.clue-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.clue-content {
  padding: 20px;
  text-align: center;
  color: #969799;
}
</style>