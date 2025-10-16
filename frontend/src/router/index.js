import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';

Vue.use(VueRouter);

// 路由懒加载
const Home = () => import('@/views/Home.vue');
const Discover = () => import('@/views/Discover.vue');
const Create = () => import('@/views/Create.vue');
const Chat = () => import('@/views/Chat.vue');
const Profile = () => import('@/views/Profile.vue');
const Login = () => import('@/views/auth/Login.vue');
const Register = () => import('@/views/auth/Register.vue');

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: true,
      keepAlive: true
    }
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover,
    meta: {
      title: '发现线索',
      requiresAuth: true,
      keepAlive: true
    }
  },
  {
    path: '/create',
    name: 'Create',
    component: Create,
    meta: {
      title: '创建线索',
      requiresAuth: true
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: '聊天',
      requiresAuth: true,
      keepAlive: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },
  // 线索详情页
  {
    path: '/clue/:id',
    name: 'ClueDetail',
    component: () => import('@/views/clue/ClueDetail.vue'),
    meta: {
      title: '线索详情',
      requiresAuth: true
    }
  },
  // 聊天房间页
  {
    path: '/chat/room/:roomId',
    name: 'ChatRoom',
    component: () => import('@/views/chat/ChatRoom.vue'),
    meta: {
      title: '聊天',
      requiresAuth: true
    }
  },
  // 设置页面
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/Settings.vue'),
    meta: {
      title: '设置',
      requiresAuth: true
    }
  },
  // 隐私设置
  {
    path: '/settings/privacy',
    name: 'PrivacySettings',
    component: () => import('@/views/settings/PrivacySettings.vue'),
    meta: {
      title: '隐私设置',
      requiresAuth: true
    }
  },
  // 404 页面
  {
    path: '*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - ThreadBond` : 'ThreadBond';

  // 防止重复导航
  if (to.path === from.path) {
    next(false);
    return;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    console.log('🔐 页面需要认证，检查登录状态...');
    
    // 检查用户是否已登录
    const isAuthenticated = store.state.auth?.isAuthenticated;
    console.log('🔍 当前认证状态:', isAuthenticated);
    
    if (!isAuthenticated) {
      // 尝试从本地存储恢复登录状态
      try {
        console.log('🔄 尝试恢复认证状态...');
        const authResult = await store.dispatch('auth/checkAuthStatus');
        
        if (authResult && store.state.auth?.isAuthenticated) {
          console.log('✅ 认证状态恢复成功，允许访问');
          next();
        } else {
          console.log('❌ 认证失败，重定向到登录页');
          // 未登录，重定向到登录页
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          });
        }
      } catch (error) {
        console.error('❌ 认证检查失败:', error);
        // 只有在非网络错误时才跳转到登录页
        if (!error.isNetworkError) {
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          });
        } else {
          // 网络错误时，显示错误提示但不跳转
          console.log('🌐 网络错误，停留在当前页面');
          next(false);
        }
      }
    } else {
      console.log('✅ 已认证，允许访问');
      next();
    }
  } else {
    // 不需要认证的页面
    if (to.path === '/login' || to.path === '/register') {
      // 如果已登录，重定向到首页
      if (store.state.auth?.isAuthenticated) {
        console.log('🏠 已登录用户访问登录页，重定向到首页');
        next('/home');
      } else {
        next();
      }
    } else {
      next();
    }
  }
});

router.afterEach((to, from) => {
  // 页面切换后的处理
  if (store.hasModule('app')) {
    try {
      store.commit('app/SET_CURRENT_ROUTE', to);
    } catch (error) {
      console.warn('路由 mutation 调用失败，尝试备用方案:', error);
      try {
        // 尝试直接设置状态
        if (store.state.app) {
          store.state.app.currentRoute = to;
        }
      } catch (fallbackError) {
        console.error('备用方案也失败:', fallbackError);
      }
    }
  }
  
  // 埋点统计
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    });
  }
});

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error);
  
  // 可以在这里添加错误上报逻辑
  if (error.message.includes('Loading chunk')) {
    // 处理代码分割加载失败的情况
    window.location.reload();
  }
});

export default router;