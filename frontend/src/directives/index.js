// 全局指令
import Vue from 'vue';

// 长按指令
Vue.directive('longpress', {
  bind(el, binding) {
    if (typeof binding.value !== 'function') {
      console.warn('v-longpress 指令需要一个函数作为值');
      return;
    }

    let timer = null;
    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return;
      }
      if (timer === null) {
        timer = setTimeout(() => {
          binding.value(e);
        }, 800);
      }
    };

    const cancel = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);
    el.addEventListener('click', cancel);
    el.addEventListener('mouseout', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
  }
});

// 防抖指令
Vue.directive('debounce', {
  inserted(el, binding) {
    let timer = null;
    const delay = binding.arg || 300;
    
    el.addEventListener('click', () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        binding.value();
      }, delay);
    });
  }
});

// 节流指令
Vue.directive('throttle', {
  inserted(el, binding) {
    let timer = null;
    const delay = binding.arg || 300;
    
    el.addEventListener('click', () => {
      if (!timer) {
        timer = setTimeout(() => {
          binding.value();
          timer = null;
        }, delay);
      }
    });
  }
});

// 复制到剪贴板指令
Vue.directive('copy', {
  bind(el, binding) {
    el.copyData = binding.value;
    el.addEventListener('click', handleClick);
  },
  update(el, binding) {
    el.copyData = binding.value;
  },
  unbind(el) {
    el.removeEventListener('click', handleClick);
  }
});

function handleClick(e) {
  const input = document.createElement('input');
  input.value = e.target.copyData || e.target.innerText;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  
  // 可以在这里添加复制成功的提示
  console.log('复制成功:', input.value);
}

// 图片懒加载指令
Vue.directive('lazy', {
  bind(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = binding.value;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    el.classList.add('lazy');
    observer.observe(el);
  }
});

// 无限滚动指令
Vue.directive('infinite-scroll', {
  bind(el, binding) {
    const callback = binding.value;
    const options = binding.modifiers;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const threshold = options.threshold || 100;
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        callback();
      }
    };
    
    el.addEventListener('scroll', handleScroll);
    el._handleScroll = handleScroll;
  },
  unbind(el) {
    el.removeEventListener('scroll', el._handleScroll);
  }
});