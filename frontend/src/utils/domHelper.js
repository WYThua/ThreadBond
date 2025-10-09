// DOM 操作辅助工具
export class DOMHelper {
  /**
   * 安全地获取元素的边界矩形
   * @param {Element|string} element - DOM 元素或选择器
   * @returns {DOMRect|null} 边界矩形对象或 null
   */
  static getBoundingClientRect(element) {
    try {
      let el = element;
      
      // 如果传入的是字符串选择器，先获取元素
      if (typeof element === 'string') {
        el = document.querySelector(element);
      }
      
      // 检查元素是否存在
      if (!el || typeof el.getBoundingClientRect !== 'function') {
        console.warn('DOMHelper: 元素不存在或不支持 getBoundingClientRect 方法', element);
        return null;
      }
      
      return el.getBoundingClientRect();
    } catch (error) {
      console.error('DOMHelper: getBoundingClientRect 调用失败', error);
      return null;
    }
  }
  
  /**
   * 安全地获取元素的尺寸信息
   * @param {Element|string} element - DOM 元素或选择器
   * @returns {Object} 包含宽高信息的对象
   */
  static getElementSize(element) {
    try {
      let el = element;
      
      if (typeof element === 'string') {
        el = document.querySelector(element);
      }
      
      if (!el) {
        return { width: 0, height: 0, offsetWidth: 0, offsetHeight: 0 };
      }
      
      return {
        width: el.clientWidth || 0,
        height: el.clientHeight || 0,
        offsetWidth: el.offsetWidth || 0,
        offsetHeight: el.offsetHeight || 0,
        scrollWidth: el.scrollWidth || 0,
        scrollHeight: el.scrollHeight || 0
      };
    } catch (error) {
      console.error('DOMHelper: getElementSize 调用失败', error);
      return { width: 0, height: 0, offsetWidth: 0, offsetHeight: 0 };
    }
  }
  
  /**
   * 等待元素出现在 DOM 中
   * @param {string} selector - 元素选择器
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Element|null>} 元素或 null
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // 设置超时
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }
  
  /**
   * 安全地设置元素高度
   * @param {Element|string} element - DOM 元素或选择器
   * @param {number|string} height - 高度值
   */
  static setHeight(element, height) {
    try {
      let el = element;
      
      if (typeof element === 'string') {
        el = document.querySelector(element);
      }
      
      if (!el) {
        console.warn('DOMHelper: setHeight 目标元素不存在', element);
        return;
      }
      
      if (typeof height === 'number') {
        el.style.height = height + 'px';
      } else {
        el.style.height = height;
      }
    } catch (error) {
      console.error('DOMHelper: setHeight 调用失败', error);
    }
  }
  
  /**
   * 检查元素是否在视口中
   * @param {Element|string} element - DOM 元素或选择器
   * @returns {boolean} 是否在视口中
   */
  static isInViewport(element) {
    try {
      const rect = this.getBoundingClientRect(element);
      
      if (!rect) {
        return false;
      }
      
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    } catch (error) {
      console.error('DOMHelper: isInViewport 调用失败', error);
      return false;
    }
  }
}

// 全局错误处理
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('getBoundingClientRect')) {
    console.warn('捕获到 getBoundingClientRect 相关错误，已被安全处理:', event.error);
    event.preventDefault();
  }
});

export default DOMHelper;