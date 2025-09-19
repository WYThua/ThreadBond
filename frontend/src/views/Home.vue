<template>
  <div class="home-page">
    <van-nav-bar title="ThreadBond" />
    
    <div class="home-content">
      <div class="welcome-section">
        <h2>欢迎来到 ThreadBond</h2>
        <p>项目基础架构已搭建完成</p>
      </div>

      <div class="status-cards">
        <div class="status-card">
          <van-icon name="checked" color="#07c160" size="24" />
          <div class="card-content">
            <h3>后端服务</h3>
            <p>Node.js + Express + TypeScript</p>
          </div>
        </div>

        <div class="status-card">
          <van-icon name="checked" color="#07c160" size="24" />
          <div class="card-content">
            <h3>前端应用</h3>
            <p>Vue 2 + Vant UI + PWA</p>
          </div>
        </div>

        <div class="status-card">
          <van-icon name="checked" color="#07c160" size="24" />
          <div class="card-content">
            <h3>数据库</h3>
            <p>MySQL + Redis + Prisma</p>
          </div>
        </div>

        <div class="status-card">
          <van-icon name="checked" color="#07c160" size="24" />
          <div class="card-content">
            <h3>实时通信</h3>
            <p>Socket.IO + 认证系统</p>
          </div>
        </div>
      </div>

      <div class="next-steps">
        <h3>下一步开发计划</h3>
        <van-cell-group>
          <van-cell title="用户注册功能" label="实现完整的用户注册流程" />
          <van-cell title="用户登录认证" label="JWT 认证和会话管理" />
          <van-cell title="匿名身份生成" label="AI 驱动的个性化身份系统" />
          <van-cell title="线索创建系统" label="多媒体线索编辑器" />
          <van-cell title="解密互动机制" label="线索解密和聊天触发" />
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  
  mounted() {
    console.log('首页已加载 - 项目基础架构搭建完成');
  }
};
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.home-content {
  padding: 20px;
}

.welcome-section {
  text-align: center;
  padding: 40px 0;
  
  h2 {
    color: #323233;
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  p {
    color: #969799;
    font-size: 14px;
  }
}

.status-cards {
  margin-bottom: 30px;
  
  .status-card {
    display: flex;
    align-items: center;
    background: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .card-content {
      margin-left: 12px;
      
      h3 {
        font-size: 16px;
        color: #323233;
        margin: 0 0 4px;
      }
      
      p {
        font-size: 12px;
        color: #969799;
        margin: 0;
      }
    }
  }
}

.next-steps {
  h3 {
    color: #323233;
    font-size: 18px;
    margin-bottom: 16px;
  }
}
</style>