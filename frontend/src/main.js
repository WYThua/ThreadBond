import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Vant UI 组件
import {
  Button,
  Cell,
  CellGroup,
  Icon,
  Image as VanImage,
  Loading,
  Toast,
  Dialog,
  Notify,
  NavBar,
  Tabbar,
  TabbarItem,
  Field,
  Form,
  Card,
  Tag,
  Grid,
  GridItem,
  List,
  PullRefresh,
  SwipeCell,
  ActionSheet,
  Popup,
  Overlay,
  Sticky,
  Tab,
  Tabs,
  Swipe,
  SwipeItem,
  Lazyload,
  ImagePreview,
  Uploader,
  Progress,
  Circle,
  CountDown,
  Divider,
  Empty,
  Skeleton,
  BackTop,
  Search,
  DropdownMenu,
  DropdownItem
} from 'vant';

// 注册 Vant 组件
Vue.use(Button);
Vue.use(Cell);
Vue.use(CellGroup);
Vue.use(Icon);
Vue.use(VanImage);
Vue.use(Loading);
Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Notify);
Vue.use(NavBar);
Vue.use(Tabbar);
Vue.use(TabbarItem);
Vue.use(Field);
Vue.use(Form);
Vue.use(Card);
Vue.use(Tag);
Vue.use(Grid);
Vue.use(GridItem);
Vue.use(List);
Vue.use(PullRefresh);
Vue.use(SwipeCell);
Vue.use(ActionSheet);
Vue.use(Popup);
Vue.use(Overlay);
Vue.use(Sticky);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Swipe);
Vue.use(SwipeItem);
Vue.use(Lazyload);
Vue.use(ImagePreview);
Vue.use(Uploader);
Vue.use(Progress);
Vue.use(Circle);
Vue.use(CountDown);
Vue.use(Divider);
Vue.use(Empty);
Vue.use(Skeleton);
Vue.use(BackTop);
Vue.use(Search);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);

// 全局样式
import './styles/index.scss';

// 移动端适配
import './utils/flexible';

// 全局过滤器
import './filters';

// 全局指令
import './directives';

Vue.config.productionTip = false;

// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue 全局错误:', err, info);
  Toast.fail('应用发生错误，请刷新页面重试');
};

// 全局警告处理
Vue.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue 警告:', msg, trace);
};

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');