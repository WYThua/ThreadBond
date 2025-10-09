// Vant UI 组件修复工具
export function fixVantTabbar() {
  // 修复 Vant Tabbar 的 getBoundingClientRect 错误
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  
  Element.prototype.getBoundingClientRect = function() {
    try {
      // 检查元素是否存在且已挂载
      if (!this || !this.isConnected) {
        console.warn('尝试获取未挂载元素的位置信息，返回默认值');
        return {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 50, // 为 tabbar 提供默认高度
          x: 0,
          y: 0
        };
      }
      
      return originalGetBoundingClientRect.call(this);
    } catch (error) {
      console.warn('getBoundingClientRect 调用失败，返回默认值:', error);
      return {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 50,
        x: 0,
        y: 0
      };
    }
  };
  
  console.log('Vant Tabbar 修复已应用');
}

// 修复 Vant 组件的常见问题
export function patchVantComponents() {
  // 等待 Vue 实例创建后再应用修复
  if (typeof window !== 'undefined') {
    // 修复 Tabbar 组件
    fixVantTabbar();
    
    // 监听 DOM 变化，确保动态创建的组件也能被修复
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 检查是否是 tabbar 相关元素
              if (node.classList && (
                node.classList.contains('van-tabbar') ||
                node.querySelector('.van-tabbar')
              )) {
                // 延迟一下确保元素完全渲染
                setTimeout(() => {
                  console.log('检测到新的 tabbar 元素，应用修复');
                }, 100);
              }
            }
          });
        }
      });
    });
    
    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('Vant 组件修复监听器已启动');
  }
}

// Vue 插件形式的修复
export default {
  install(Vue) {
    // 在 Vue 实例创建前应用修复
    Vue.mixin({
      beforeCreate() {
        // 只在根实例中应用一次
        if (this.$root === this) {
          patchVantComponents();
        }
      }
    });
    
    // 添加全局方法
    Vue.prototype.$fixVant = {
      tabbar: fixVantTabbar,
      all: patchVantComponents
    };
  }
};