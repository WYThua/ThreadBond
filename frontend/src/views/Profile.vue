<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心" />
    
    <div class="profile-content">
      <div class="placeholder-content">
        <van-icon name="user-o" size="60" color="#969799" />
        <h3>个人中心</h3>
        <p>个人中心功能正在开发中</p>
        <p>敬请期待...</p>
        
        <van-button 
          type="danger" 
          size="small" 
          @click="handleLogout"
          style="margin-top: 20px;"
        >
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Profile',
  
  methods: {
    ...mapActions('auth', ['logout']),
    
    async handleLogout() {
      try {
        await this.logout();
        this.$toast.success('已退出登录');
        this.$router.replace('/welcome');
      } catch (error) {
        console.error('退出登录失败:', error);
        this.$toast.fail('退出登录失败');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.profile-content {
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