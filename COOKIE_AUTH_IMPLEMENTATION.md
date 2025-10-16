# Cookie 认证状态实现

## 概述

将登录状态从 localStorage 迁移到 Cookie 存储，提供更好的持久化和安全性。

## 实现特性

### 1. Cookie 存储优势
- **自动过期**: 可设置 Cookie 过期时间，自动清理过期认证
- **跨标签页同步**: 同域名下所有标签页自动同步认证状态
- **安全选项**: 支持 Secure、SameSite 等安全标志
- **自动发送**: Cookie 随 HTTP 请求自动发送到服务器

### 2. 存储内容
- `threadbond_token`: JWT 认证令牌
- `threadbond_refresh_token`: 刷新令牌
- `threadbond_auth_status`: 认证状态标志
- `threadbond_user_info`: 用户基本信息

### 3. 安全配置
```javascript
options: {
  secure: process.env.NODE_ENV === 'production', // 生产环境 HTTPS
  sameSite: 'lax', // CSRF 保护
  path: '/' // 全站可用
}
```

## 核心文件

### 1. Cookie 工具类 (`frontend/src/utils/cookieAuth.js`)
- 封装所有 Cookie 操作
- 提供统一的认证状态管理接口
- 支持从 localStorage 自动迁移
- 包含完整的错误处理和日志

### 2. 认证模块更新 (`frontend/src/store/modules/auth.js`)
- 使用 Cookie 存储替代 localStorage
- 应用启动时自动迁移旧数据
- 保持向后兼容性

### 3. 用户模块更新 (`frontend/src/store/modules/user.js`)
- 从 Cookie 恢复用户信息
- 同步更新 Cookie 和 Vuex 状态

## 主要方法

### CookieAuth 类方法
```javascript
// Token 管理
setToken(token, expires)
getToken()
removeToken()

// 认证状态
setAuthStatus(isAuthenticated)
getAuthStatus()
removeAuthStatus()

// 用户信息
setUserInfo(userInfo)
getUserInfo()
removeUserInfo()

// 工具方法
clearAll()
hasValidAuth()
migrateFromLocalStorage()
```

## 迁移策略

### 1. 自动迁移
- 应用启动时检查 localStorage 中的旧数据
- 自动迁移到 Cookie 存储
- 迁移完成后清理 localStorage

### 2. 向后兼容
- 保持对旧版本的兼容性
- 渐进式迁移，不影响现有用户

### 3. 数据验证
- 迁移时验证数据完整性
- 自动清理损坏的数据

## 使用示例

### 基本使用
```javascript
import cookieAuth from '@/utils/cookieAuth';

// 设置认证信息
cookieAuth.setToken('jwt-token-here');
cookieAuth.setAuthStatus(true);
cookieAuth.setUserInfo({ id: 1, email: 'user@example.com' });

// 获取认证信息
const token = cookieAuth.getToken();
const isAuth = cookieAuth.getAuthStatus();
const userInfo = cookieAuth.getUserInfo();

// 检查认证有效性
if (cookieAuth.hasValidAuth()) {
  // 用户已认证
}

// 清除所有认证信息
cookieAuth.clearAll();
```

### 在 Vuex 中使用
```javascript
// 设置认证状态
commit('SET_AUTHENTICATED', true); // 自动同步到 Cookie

// 设置用户信息
commit('user/SET_USER_INFO', userInfo); // 自动保存到 Cookie
```

## 调试功能

### 1. 详细日志
- 所有 Cookie 操作都有详细的控制台日志
- 便于开发和调试

### 2. 配置查看
```javascript
// 查看当前配置和状态
console.log(cookieAuth.getConfig());
```

### 3. 迁移日志
- 自动迁移过程有完整的日志记录
- 便于排查迁移问题

## 优势总结

1. **更好的持久化**: Cookie 比 localStorage 更可靠
2. **自动同步**: 跨标签页自动同步认证状态
3. **安全性**: 支持多种安全选项
4. **向后兼容**: 平滑迁移，不影响现有用户
5. **易于调试**: 完整的日志和调试功能
6. **统一管理**: 所有认证相关操作集中管理

## 注意事项

1. **Cookie 大小限制**: 单个 Cookie 最大 4KB
2. **域名限制**: Cookie 只在设置的域名下有效
3. **HTTPS 要求**: 生产环境建议使用 Secure 标志
4. **浏览器支持**: 现代浏览器都支持，IE 需要注意兼容性