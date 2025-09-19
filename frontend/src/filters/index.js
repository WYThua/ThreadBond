// 全局过滤器
import Vue from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 时间格式化过滤器
Vue.filter('formatTime', (value, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!value) return '';
  return dayjs(value).format(format);
});

// 相对时间过滤器
Vue.filter('fromNow', (value) => {
  if (!value) return '';
  return dayjs(value).fromNow();
});

// 数字格式化过滤器
Vue.filter('formatNumber', (value) => {
  if (!value && value !== 0) return '';
  
  const num = Number(value);
  if (num < 1000) return num.toString();
  if (num < 10000) return (num / 1000).toFixed(1) + 'K';
  if (num < 100000000) return (num / 10000).toFixed(1) + '万';
  return (num / 100000000).toFixed(1) + '亿';
});

// 文件大小格式化过滤器
Vue.filter('formatFileSize', (value) => {
  if (!value && value !== 0) return '';
  
  const size = Number(value);
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
  return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
});

// 文本截断过滤器
Vue.filter('truncate', (value, length = 50, suffix = '...') => {
  if (!value) return '';
  if (value.length <= length) return value;
  return value.substring(0, length) + suffix;
});

// 首字母大写过滤器
Vue.filter('capitalize', (value) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
});

// 货币格式化过滤器
Vue.filter('currency', (value, currency = '¥') => {
  if (!value && value !== 0) return '';
  return currency + Number(value).toFixed(2);
});

// 百分比格式化过滤器
Vue.filter('percentage', (value, decimals = 1) => {
  if (!value && value !== 0) return '';
  return (Number(value) * 100).toFixed(decimals) + '%';
});