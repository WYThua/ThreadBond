# 注册接口错误解决方案

## 问题描述

前端注册时出现两种错误：
1. **Network Error**: AxiosError 网络连接错误
2. **400 Bad Request**: 请求参数验证失败

## 问题原因分析

### 1. Network Error 原因
- 后端服务未启动或不可访问
- CORS 配置问题
- 前端 API 配置错误

### 2. 400 Bad Request 原因
- **频率限制器阻止**: 注册接口有严格的频率限制（每小时3次）
- **密码验证失败**: 后端要求密码必须包含大小写字母、数字和特殊字符
- **邮箱格式错误**: 邮箱格式不符合要求

## 解决方案

### 1. 修复频率限制问题

修改了 `backend/src/middleware/rateLimiter.ts`:

```typescript
// 注册速率限制 (开发环境放宽限制)
export const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟 (开发环境)
  max: 10, // 每个IP每5分钟最多10次注册尝试 (开发环境)
  message: {
    success: false,
    message: '注册尝试过于频繁，请5分钟后再试',
    retryAfter: '5分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 开发环境跳过频率限制
    return process.env.NODE_ENV === 'development';
  }
});
```

### 2. 密码验证要求

后端密码验证规则（`backend/src/utils/validation.ts`）:

```typescript
password: Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
```

**密码必须满足:**
- 长度至少 8 位
- 包含小写字母 (a-z)
- 包含大写字母 (A-Z)
- 包含数字 (0-9)
- 包含特殊字符 (@$!%*?&)

**有效密码示例:**
- `Test123!@#`
- `MyPass123$`
- `Secure2024!`
- `Strong@Pass1`

### 3. 前端密码验证

前端 `Register.vue` 已经实现了相应的密码强度检查:

```javascript
validatePassword(value) {
  if (value.length < 8) return '密码至少8位';
  if (!/[A-Z]/.test(value)) return '密码必须包含大写字母';
  if (!/[a-z]/.test(value)) return '密码必须包含小写字母';
  if (!/\d/.test(value)) return '密码必须包含数字';
  if (!/[@$!%*?&]/.test(value)) return '密码必须包含特殊字符(@$!%*?&)';
  return true;
}
```

## 测试验证

### 1. 后端 API 测试

```bash
# 健康检查
curl http://localhost:3000/health

# 注册测试
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

### 2. 前端测试

1. 确保前端运行在支持的端口 (8080, 8081, 8083)
2. 使用符合要求的密码进行注册
3. 检查浏览器控制台是否有错误信息

## 当前状态

✅ **已解决的问题:**
- 后端服务正常运行
- 频率限制器已调整为开发友好模式
- 密码验证规则明确
- CORS 配置正确

✅ **测试结果:**
- 后端 API 注册接口正常工作
- 返回 201 状态码和用户数据
- 包含 JWT token 和匿名身份信息

## 使用建议

### 1. 开发环境
- 使用强密码进行测试: `Test123!@#`
- 如遇频率限制，等待5分钟或重启后端服务
- 检查浏览器控制台的详细错误信息

### 2. 生产环境
- 恢复严格的频率限制设置
- 添加更多的安全验证
- 考虑添加验证码机制

## 故障排除

如果仍然遇到问题：

1. **检查后端服务状态:**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   ```

2. **检查前端配置:**
   ```bash
   # 查看前端环境变量
   cat frontend/.env
   ```

3. **清除浏览器缓存:**
   - 清除 localStorage
   - 清除 cookies
   - 尝试无痕模式

4. **查看详细错误:**
   - 打开浏览器开发者工具
   - 查看 Network 标签的请求详情
   - 查看 Console 标签的错误信息

## 相关文件

- `backend/src/middleware/rateLimiter.ts` - 频率限制配置
- `backend/src/utils/validation.ts` - 验证规则
- `backend/src/routes/auth.ts` - 认证路由
- `frontend/src/views/auth/Register.vue` - 注册页面
- `frontend/src/store/modules/auth.js` - 认证状态管理
- `frontend/src/api/auth.js` - API 接口调用