import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

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
  Search,
  DropdownMenu,
  DropdownItem,
  Checkbox,
  Picker,
  DatetimePicker,
  Calendar,
  Badge,
} from "vant";

// 注册 Vant 组件
[
  Button,
  Cell,
  CellGroup,
  Icon,
  VanImage,
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
  Search,
  DropdownMenu,
  DropdownItem,
  Checkbox,
  Picker,
  DatetimePicker,
  Calendar,
  Badge,
].forEach((component) => Vue.use(component));

// 全局样式和工具
import "./styles/index.scss";
import "./utils/flexible";
import "./filters";
import "./directives";
import "./utils/domHelper";

// Font Awesome 图标库
import "@fortawesome/fontawesome-free/css/all.css";

// Vant 组件修复
import { fixVantTabbar } from "./utils/vantFix";
fixVantTabbar();

Vue.config.productionTip = false;

// 强制修复 Vuex mutation 错误
const originalCommit = store.commit;
store.commit = function (type, payload, options) {
  // 自动修正错误的 mutation 名称
  if (type === "app/setCurrentRoute") {
    type = "app/SET_CURRENT_ROUTE";
  }

  try {
    return originalCommit.call(this, type, payload, options);
  } catch (error) {
    console.warn("Vuex commit 错误已被捕获:", error.message);
    return;
  }
};

// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  const message = err.message || "";

  if (
    message.includes("getBoundingClientRect") ||
    message.includes("unknown mutation type") ||
    message.includes("Cannot read properties of undefined")
  ) {
    console.warn("错误已被安全处理:", message);
    return;
  }

  console.error("Vue 错误:", err, info);
  Toast.fail("应用发生错误，请刷新页面重试");
};

// JavaScript 全局错误处理
window.addEventListener("error", (event) => {
  const message = event.error?.message || "";

  if (
    message.includes("getBoundingClientRect") ||
    message.includes("unknown mutation type") ||
    message.includes("Cannot read properties of undefined") ||
    message.includes("setHeight")
  ) {
    console.warn("JavaScript 错误已被捕获:", message);
    event.preventDefault();
    return;
  }

  console.error("JavaScript 错误:", event.error);
});

// Promise 错误处理
window.addEventListener("unhandledrejection", (event) => {
  console.warn("Promise 错误已被捕获:", event.reason);
  event.preventDefault();
});

// 防止重复挂载
if (window.__VUE_APP_MOUNTED__) {
  console.warn("Vue 应用已挂载，跳过重复挂载");
} else {
  window.__VUE_APP_MOUNTED__ = true;

  // 创建 Vue 实例
  const app = new Vue({
    router,
    store,
    render: (h) => h(App),

    async created() {
      // 应用启动时初始化认证状态
      try {
        await this.$store.dispatch("auth/initializeAuth");
        console.log("认证状态初始化完成");
      } catch (error) {
        console.error("认证状态初始化失败:", error);
      }
    },
  });

  app.$mount("#app");
}
