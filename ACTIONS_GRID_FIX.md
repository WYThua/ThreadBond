# Actions Grid 显示问题修复

## 问题描述

actions-grid 中左边的盒子没有显示内容，可能是背景色或布局问题。

## 问题分析

经过检查发现可能的问题：
1. CSS 变量在某些浏览器中可能不被支持
2. 卡片高度不够，内容可能被压缩
3. 布局可能存在问题

## 修复方案

### 1. 添加备用颜色值

为 CSS 变量添加备用值，确保在不支持 CSS 变量的浏览器中也能正常显示：

```scss
&.primary-card {
  .card-background {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
  }
}

&.secondary-card {
  .card-background {
    background: linear-gradient(135deg, #4facfe 0%, #00d4aa 100%);
    background: linear-gradient(135deg, var(--success-color, #4facfe) 0%, #00d4aa 100%);
  }
}
```

### 2. 确保卡片有足够的高度

为 action-card 添加最小高度和 flex 布局：

```scss
.action-card {
  position: relative;
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  flex-direction: column;
}
```

### 3. 优化内容布局

为 card-content 添加高度和最小高度：

```scss
.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 120px;
}
```

## 预期效果

修复后的 actions-grid 应该：
- 左边的"创建线索"卡片显示紫色渐变背景
- 右边的"发现线索"卡片显示蓝绿色渐变背景
- 两个卡片都有足够的高度显示内容
- 文字和图标正确显示在渐变背景上

## 调试建议

如果问题仍然存在，可以：
1. 检查浏览器开发者工具中的 CSS 样式是否正确应用
2. 确认 CSS 变量是否被正确解析
3. 检查是否有其他 CSS 规则覆盖了这些样式
4. 验证 HTML 结构是否正确

## 测试方法

1. 刷新页面
2. 检查 actions-grid 中的两个卡片是否都有背景色
3. 确认文字内容是否清晰可见
4. 测试点击功能是否正常工作