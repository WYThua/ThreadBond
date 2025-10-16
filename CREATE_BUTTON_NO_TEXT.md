# 创建按钮移除文字

## 修改内容

### ➕ 创建按钮优化
- **移除文字**: 创建按钮下方不再显示"创建"文字
- **仅显示符号**: 只保留 ➕ 符号
- **居中显示**: 符号在按钮区域内完全居中
- **增大尺寸**: 符号从 24px 增加到 28px，更容易点击

### 🎨 样式调整
```scss
&.create-tab {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  .create-icon {
    font-size: 28px !important;
    margin: 0 !important;
    // 居中显示，无边距
  }
}
```

### 📱 模板结构
```vue
<!-- 创建按钮只有图标，无文字 -->
<van-tabbar-item to="/create" class="create-tab">
  <template #icon>
    <span class="create-icon">➕</span>
  </template>
</van-tabbar-item>
```

## 优势

1. **更简洁**: 符号本身就很直观，无需额外文字说明
2. **更突出**: ➕ 符号更加醒目
3. **节省空间**: 为其他导航项留出更多空间
4. **国际化友好**: 符号无语言障碍
5. **现代设计**: 符合当前移动应用的设计趋势

创建按钮现在只显示 ➕ 符号，简洁明了地表达创建功能。