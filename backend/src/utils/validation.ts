import Joi from 'joi';

// 用户注册验证规则
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱地址不能为空'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '密码长度至少为6位',
      'string.max': '密码长度不能超过128位',
      'any.required': '密码不能为空'
    })
});

// 用户登录验证规则
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱地址不能为空'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码不能为空'
    })
});

// 邮箱验证码验证规则
export const verificationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱地址不能为空'
    }),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': '验证码必须为6位数字',
      'string.pattern.base': '验证码必须为6位数字',
      'any.required': '验证码不能为空'
    })
});

// 匿名身份更新验证规则
export const anonymousIdentitySchema = Joi.object({
  displayName: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.min': '昵称长度至少为2位',
      'string.max': '昵称长度不能超过20位',
      'string.pattern.base': '昵称只能包含中文、英文、数字和下划线',
      'any.required': '昵称不能为空'
    }),
  avatarUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': '头像URL格式不正确'
    }),
  personalityTraits: Joi.array()
    .items(Joi.string().max(10))
    .max(8)
    .optional()
    .messages({
      'array.max': '个性特征最多选择8个',
      'string.max': '个性特征长度不能超过10位'
    })
});

/**
 * 验证请求数据
 */
export function validateRequest(schema: Joi.ObjectSchema, data: any) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(errorMessages.join('; '));
  }

  return value;
}

/**
 * 检查邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length >= 6) {
    score += 1;
    if (password.length >= 8) {
      score += 1; // 8位以上额外加分
    }
  } else {
    feedback.push('密码长度至少为6位');
  }

  // 包含小写字母（可选，加分项）
  if (/[a-z]/.test(password)) {
    score += 1;
  }

  // 包含大写字母（可选，加分项）
  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // 包含数字（可选，加分项）
  if (/\d/.test(password)) {
    score += 1;
  }

  // 包含特殊字符（可选，加分项）
  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  }

  return {
    isValid: password.length >= 6, // 只要长度大于等于6位就有效
    score: Math.min(score, 5),
    feedback
  };
}