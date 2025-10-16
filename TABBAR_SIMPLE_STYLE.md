# 底部导航栏简化样式

## 修改内容

### 📝 字体大小调整
- **文字大小**: 从 11px 增加到 13px
- **更好的可读性**: 在移动设备上更容易阅读
- **保持比例**: 图标和文字的比例协调

### 🎯 高亮样式简化
- **移除背景色**: 不再使用背景色或渐变背景
- **仅文字颜色变化**: 选中状态只改变图标和文字颜色为主题色
- **移除动画效果**: 去掉缩放和悬浮效果
- **简洁设计**: 更符合简约设计原则

### ➕ 创建按钮改进
- **使用 ➕ 符号**: 替换原来的 plus 图标
- **移除彩色盒子**: 不再使用渐变背景容器
- **统一样式**: 与其他导航项保持一致的样式
- **自定义图标**: 使用 template #icon 插槽

### 🎨 样式对比

#### 修改前
```scss
// 选中状态有背景色和动画
&.van-tabbar-item--active {
  .van-icon {
    transform: scale(1.1);
  }
  &::before {
    background: linear-gradient(...);
    opacity: 0.1;
  }
}

// 创建按钮有彩色背景
&.create-tab .van-icon {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-radius: 16px;
}
```

#### 修改后
```scss
// 选中状态仅改变颜色
&.van-tabbar-item--active {
  .van-icon {
    color: var(--primary-color) !important;
  }
  .van-tabbar-item__text {
    color: var(--primary-color) !important;
    font-weight: 600;
  }
}

// 创建按钮使用简单符号
&.create-tab {
  .create-icon {
    font-size: 24px !important;
    color: var(--text-color-3) !important;
  }
}
```

### 📱 模板结构
```vue
<!-- 创建按钮使用自定义图标 -->
<van-tabbar-item to="/create" class="create-tab">
  <template #icon>
    <span class="create-icon">➕</span>
  </template>
  创建
</van-tabbar-item>
```

## 优势

1. **更简洁**: 移除了复杂的视觉效果
2. **更清晰**: 增大的字体提升可读性
3. **更统一**: 所有导航项样式保持一致
4. **更轻量**: 减少了 CSS 代码和动画效果
5. **更直观**: ➕ 符号直观表达创建功能

这个简化版本保持了功能完整性，同时提供了更清爽的用户界面。