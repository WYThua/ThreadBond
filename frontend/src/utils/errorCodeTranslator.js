/**
 * 错误码转换器
 * 将后端返回的技术性错误码转换为用户友好的错误消息
 */

/**
 * 错误码映射表 - 保持英文错误消息，不进行中文转换
 * 根据用户需求，所有错误消息都保持英文显示
 */
const ERROR_CODE_MAP = {
  // 登录相关错误映射 - 保持英文
  login: {
    401: {
      // 保持原始英文错误消息
      'Invalid password': 'Invalid password',
      'Wrong password': 'Wrong password',
      'Password incorrect': 'Password incorrect',
      'Incorrect password': 'Incorrect password',
      'password': 'Invalid password',
      
      // 用户不存在相关错误
      'User not found': 'User not found',
      'User does not exist': 'User does not exist',
      'No such user': 'No such user',
      'user not found': 'User not found',
      'Email not found': 'Email not found',
      'email not found': 'Email not found',
      
      // 账户禁用相关错误
      'Account disabled': 'Account disabled',
      'Account suspended': 'Account suspended',
      'User disabled': 'User disabled',
      'account disabled': 'Account disabled',
      'User suspended': 'User suspended',
      'Account locked': 'Account locked',
      
      // 默认登录错误
      'default': 'Invalid email or password'
    },
    // 其他登录相关状态码
    400: 'Bad request',
    403: 'Forbidden',
    423: 'Account locked',
    429: 'Too many login attempts'
  },
  
  // 网络错误类型映射 - 保持英文
  network: {
    // 服务器错误
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
    
    // 网络连接错误
    'NETWORK_ERROR': 'Network Error',
    'ERR_NETWORK': 'Network Error',
    'ERR_INTERNET_DISCONNECTED': 'Network Error',
    'ERR_CONNECTION_REFUSED': 'Connection Refused',
    'ERR_CONNECTION_RESET': 'Connection Reset',
    'Network Error': 'Network Error',
    'Connection failed': 'Connection Failed',
    
    // 超时错误
    'TIMEOUT': 'Request Timeout',
    'ERR_TIMEOUT': 'Request Timeout',
    'ECONNABORTED': 'Request Timeout',
    'ERR_CONNECTION_TIMED_OUT': 'Connection Timeout',
    'Request timeout': 'Request Timeout',
    'Connection timeout': 'Connection Timeout'
  },
  
  // 表单验证错误映射 - 保持英文
  validation: {
    // 400 错误的详细字段处理
    400: {
      'email': 'Invalid email format',
      'Email': 'Invalid email format',
      'email_format': 'Invalid email format',
      'invalid_email': 'Invalid email format',
      'email_invalid': 'Invalid email format',
      'Invalid email format': 'Invalid email format',
      'Email format invalid': 'Invalid email format',
      
      'password': 'Invalid password format',
      'Password': 'Invalid password format',
      'password_format': 'Invalid password format',
      'invalid_password': 'Invalid password format',
      'password_invalid': 'Invalid password format',
      'Invalid password format': 'Invalid password format',
      'Password format invalid': 'Invalid password format',
      'password_too_short': 'Password too short',
      'password_too_weak': 'Password too weak',
      'Password too short': 'Password too short',
      'Password too weak': 'Password too weak',
      
      'username': 'Invalid username format',
      'name': 'Invalid name format',
      'phone': 'Invalid phone format',
      'age': 'Invalid age format',
      'Invalid input': 'Invalid input',
      'Bad request': 'Bad Request',
      
      // 通用400错误
      'default': 'Bad Request'
    },
    
    // 409 冲突错误
    409: {
      'email': 'Email already exists',
      'Email': 'Email already exists',
      'Email already exists': 'Email already exists',
      'email_exists': 'Email already exists',
      'duplicate_email': 'Email already exists',
      'Email already registered': 'Email already registered',
      'User already exists': 'User already exists',
      'Account already exists': 'Account already exists',
      'username': 'Username already exists',
      'phone': 'Phone already exists',
      'Conflict': 'Conflict',
      'default': 'Conflict'
    },
    
    // 422 验证错误
    422: {
      'missing_fields': 'Missing required fields',
      'validation_failed': 'Validation failed',
      'invalid_data': 'Invalid data',
      'Validation failed': 'Validation failed',
      'Invalid data': 'Invalid data',
      'Missing required fields': 'Missing required fields',
      'Unprocessable Entity': 'Unprocessable Entity',
      'default': 'Unprocessable Entity'
    },
    
    // 其他验证相关错误
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    429: 'Too Many Requests'
  },
  
  // 业务逻辑错误映射 - 保持英文
  business: {
    // 403 权限错误
    403: {
      'insufficient_permissions': 'Insufficient Permissions',
      'access_denied': 'Access Denied',
      'forbidden': 'Forbidden',
      'permission_denied': 'Permission Denied',
      'Access denied': 'Access Denied',
      'Forbidden': 'Forbidden',
      'Permission denied': 'Permission Denied',
      'Insufficient permissions': 'Insufficient Permissions',
      'default': 'Forbidden'
    },
    
    // 404 资源不存在
    404: {
      'not_found': 'Not Found',
      'resource_not_found': 'Resource Not Found',
      'page_not_found': 'Page Not Found',
      'user_not_found': 'User Not Found',
      'data_not_found': 'Data Not Found',
      'Not found': 'Not Found',
      'Resource not found': 'Resource Not Found',
      'Page not found': 'Page Not Found',
      'User not found': 'User Not Found',
      'Data not found': 'Data Not Found',
      'default': 'Not Found'
    },
    
    // 410 资源已过期
    410: {
      'resource_expired': 'Resource Expired',
      'link_expired': 'Link Expired',
      'token_expired': 'Token Expired',
      'session_expired': 'Session Expired',
      'Resource expired': 'Resource Expired',
      'Link expired': 'Link Expired',
      'Token expired': 'Token Expired',
      'Session expired': 'Session Expired',
      'Gone': 'Gone',
      'default': 'Gone'
    },
    
    // 429 频率限制
    429: {
      'rate_limit_exceeded': 'Rate Limit Exceeded',
      'too_many_requests': 'Too Many Requests',
      'request_limit': 'Request Limit Exceeded',
      'Rate limit exceeded': 'Rate Limit Exceeded',
      'Too many requests': 'Too Many Requests',
      'Request limit exceeded': 'Request Limit Exceeded',
      'Too Many Requests': 'Too Many Requests',
      'default': 'Too Many Requests'
    },
    
    // 其他业务错误
    402: 'Payment Required',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    408: 'Request Timeout',
    409: 'Conflict',
    411: 'Length Required',
    412: 'Precondition Failed',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot", // RFC 2324
    421: 'Misdirected Request',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons'
  },
  
  // 特殊错误类型映射 - 保持英文
  special: {
    // 客户端错误
    'CLIENT_ERROR': 'Client Error',
    'PARSE_ERROR': 'Parse Error',
    'INVALID_JSON': 'Invalid JSON',
    
    // 认证相关
    'TOKEN_EXPIRED': 'Token Expired',
    'TOKEN_INVALID': 'Invalid Token',
    'SESSION_EXPIRED': 'Session Expired',
    
    // 文件上传相关
    'FILE_TOO_LARGE': 'File Too Large',
    'FILE_TYPE_NOT_SUPPORTED': 'File Type Not Supported',
    'UPLOAD_FAILED': 'Upload Failed',
    
    // 数据库相关
    'DATABASE_ERROR': 'Database Error',
    'CONNECTION_ERROR': 'Connection Error'
  }
};

class ErrorCodeTranslator {
  /**
   * 转换登录相关错误 - 保持英文
   * @param {number} statusCode - HTTP状态码
   * @param {string} message - 后端返回的错误消息
   * @returns {string} 英文错误消息
   */
  translateLoginError(statusCode, message = '') {
    const loginErrors = ERROR_CODE_MAP.login[statusCode];
    if (!loginErrors) {
      return this.translateBusinessError(statusCode, message);
    }

    // 检查是否有具体的错误消息匹配
    for (const [key, value] of Object.entries(loginErrors)) {
      if (key !== 'default' && message.includes(key)) {
        return value;
      }
    }

    // 返回默认消息
    return loginErrors.default || 'Login failed';
  }

  /**
   * 转换网络相关错误 - 保持英文
   * @param {Object} error - 错误对象
   * @returns {string} 英文错误消息
   */
  translateNetworkError(error) {
    // 首先检查错误码
    if (error.code && ERROR_CODE_MAP.network[error.code]) {
      return ERROR_CODE_MAP.network[error.code];
    }

    // 检查消息中是否包含超时相关关键词
    if (error.message && error.message.toLowerCase().includes('timeout')) {
      return ERROR_CODE_MAP.network.TIMEOUT;
    }

    // 检查是否是网络连接错误
    if (!error.response) {
      return ERROR_CODE_MAP.network.NETWORK_ERROR;
    }

    // 检查是否是超时错误
    if (error.code === 'ECONNABORTED') {
      return ERROR_CODE_MAP.network.TIMEOUT;
    }

    const statusCode = error.response?.status;
    return ERROR_CODE_MAP.network[statusCode] || 'Network Error';
  }

  /**
   * 转换表单验证错误 - 保持英文
   * @param {number} statusCode - HTTP状态码
   * @param {Object} fieldErrors - 字段错误信息
   * @param {string} message - 后端返回的错误消息
   * @returns {string} 英文错误消息
   */
  translateValidationError(statusCode, fieldErrors = {}, message = '') {
    const validationErrors = ERROR_CODE_MAP.validation[statusCode];
    
    // 处理对象类型的验证错误映射
    if (typeof validationErrors === 'object' && validationErrors !== null) {
      // 首先检查具体的字段错误
      for (const field of Object.keys(fieldErrors)) {
        if (validationErrors[field]) {
          return validationErrors[field];
        }
      }
      
      // 然后检查消息匹配
      for (const [key, value] of Object.entries(validationErrors)) {
        if (key !== 'default' && message.toLowerCase().includes(key.toLowerCase())) {
          return value;
        }
      }
      
      // 返回默认消息
      return validationErrors.default || 'Bad Request';
    }
    
    // 处理字符串类型的验证错误映射
    if (typeof validationErrors === 'string') {
      return validationErrors;
    }

    return 'Bad Request';
  }

  /**
   * 转换业务逻辑错误 - 保持英文
   * @param {number} statusCode - HTTP状态码
   * @param {string} message - 后端返回的错误消息
   * @returns {string} 英文错误消息
   */
  translateBusinessError(statusCode, message = '') {
    const businessErrors = ERROR_CODE_MAP.business[statusCode];
    
    // 如果是对象类型的映射，需要匹配具体消息
    if (typeof businessErrors === 'object' && businessErrors !== null) {
      // 首先尝试精确匹配
      if (message && businessErrors[message]) {
        return businessErrors[message];
      }
      
      // 然后尝试精确匹配（忽略大小写）
      const lowerMessage = message.toLowerCase();
      for (const [key, value] of Object.entries(businessErrors)) {
        if (key !== 'default' && key.toLowerCase() === lowerMessage) {
          return value;
        }
      }
      
      // 最后尝试包含匹配，但按键长度排序以优先匹配更具体的键
      const sortedKeys = Object.keys(businessErrors)
        .filter(key => key !== 'default')
        .sort((a, b) => b.length - a.length); // 按长度降序排序
      
      for (const key of sortedKeys) {
        if (message && message.toLowerCase().includes(key.toLowerCase())) {
          return businessErrors[key];
        }
      }
      
      // 返回默认消息
      return businessErrors.default || 'Operation Failed';
    }
    
    // 如果是字符串类型的映射，直接返回
    if (typeof businessErrors === 'string') {
      return businessErrors;
    }
    
    return 'Operation Failed';
  }

  /**
   * 转换特殊错误类型 - 保持英文
   * @param {string} errorType - 特殊错误类型
   * @returns {string} 英文错误消息
   */
  translateSpecialError(errorType) {
    return ERROR_CODE_MAP.special[errorType] || 'System Error';
  }

  /**
   * 主要的错误转换方法 - 保持英文错误消息
   * @param {Object} error - 错误对象
   * @param {string} context - 错误上下文（login, register, network等）
   * @returns {string} 英文错误消息
   */
  translate(error, context = 'general') {
    let errorMessage = '';

    // 处理网络错误
    if (!error.response) {
      errorMessage = this.translateNetworkError(error);
    } else {
      const statusCode = error.response.status;
      const message = error.response.data?.message || error.message || '';
      const fieldErrors = error.response.data?.errors || {};
      const errorType = error.response.data?.type || error.type;

      // 处理特殊错误类型
      if (errorType && ERROR_CODE_MAP.special[errorType]) {
        errorMessage = this.translateSpecialError(errorType);
      } else {
        // 根据上下文选择合适的转换方法
        switch (context) {
          case 'login':
            errorMessage = this.translateLoginError(statusCode, message);
            break;
          
          case 'register':
          case 'validation':
            errorMessage = this.translateValidationError(statusCode, fieldErrors, message);
            break;
          
          case 'network':
            errorMessage = this.translateNetworkError(error);
            break;
          
          default:
            // 通用错误处理
            if (statusCode >= 400 && statusCode < 500) {
              if (statusCode === 400 || statusCode === 422 || statusCode === 409) {
                errorMessage = this.translateValidationError(statusCode, fieldErrors, message);
              } else {
                errorMessage = this.translateBusinessError(statusCode, message);
              }
            } else if (statusCode >= 500) {
              errorMessage = this.translateNetworkError(error);
            } else {
              errorMessage = 'Operation Failed';
            }
            break;
        }
      }
    }

    return errorMessage;
  }

  /**
   * 提取错误信息
   * @param {Object} error - 错误对象
   * @returns {Object} 提取的错误信息
   */
  extractErrorInfo(error) {
    const errorInfo = {
      statusCode: null,
      message: '',
      fieldErrors: {},
      errorType: null,
      isNetworkError: false,
      originalError: error
    };

    if (!error.response) {
      // 网络错误
      errorInfo.isNetworkError = true;
      errorInfo.message = error.message || 'Network Error';
      errorInfo.errorType = error.code || 'NETWORK_ERROR';
    } else {
      // HTTP错误
      errorInfo.statusCode = error.response.status;
      errorInfo.message = error.response.data?.message || error.message || '';
      errorInfo.fieldErrors = error.response.data?.errors || {};
      errorInfo.errorType = error.response.data?.type || null;
    }

    return errorInfo;
  }

  /**
   * 检查是否包含技术术语 (需求 1.5, 2.5, 3.5, 4.5)
   * @param {string} message - 错误消息
   * @returns {boolean} 是否包含技术术语
   */
  containsTechnicalTerms(message) {
    if (!message) return false;
    
    // 检查是否包含映射表中的技术术语
    return Object.keys(ERROR_CODE_MAP.technicalTerms).some(term => 
      message.toLowerCase().includes(term.toLowerCase())
    );
  }

  /**
   * 隐藏技术术语，转换为用户友好消息 (需求 1.5, 2.5, 3.5, 4.5)
   * @param {string} message - 包含技术术语的消息
   * @returns {string} 转换后的用户友好消息
   */
  hideTechnicalTerms(message) {
    if (!message) return '操作失败，请稍后重试';
    
    let friendlyMessage = message;
    
    // 按术语长度降序排序，优先匹配更长的术语
    const sortedTerms = Object.keys(ERROR_CODE_MAP.technicalTerms)
      .sort((a, b) => b.length - a.length);
    
    for (const term of sortedTerms) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(friendlyMessage)) {
        return ERROR_CODE_MAP.technicalTerms[term];
      }
    }
    
    // 如果没有找到匹配的技术术语，但消息包含数字（可能是状态码）
    if (/\d{3}/.test(friendlyMessage)) {
      return '操作失败，请稍后重试';
    }
    
    return friendlyMessage;
  }

  /**
   * 获取所有支持的错误码
   * @returns {Object} 支持的错误码映射
   */
  getSupportedErrorCodes() {
    return {
      login: Object.keys(ERROR_CODE_MAP.login),
      network: Object.keys(ERROR_CODE_MAP.network),
      validation: Object.keys(ERROR_CODE_MAP.validation),
      business: Object.keys(ERROR_CODE_MAP.business),
      special: Object.keys(ERROR_CODE_MAP.special)
    };
  }

  /**
   * 验证错误码映射表的完整性
   * @returns {Object} 验证结果
   */
  validateErrorCodeMap() {
    const validation = {
      isValid: true,
      missingMappings: [],
      warnings: [],
      requirementsCoverage: {}
    };

    // 检查登录错误映射
    const loginRequirements = {
      '401_password': ERROR_CODE_MAP.login[401] && ERROR_CODE_MAP.login[401]['Invalid password'],
      '401_user': ERROR_CODE_MAP.login[401] && ERROR_CODE_MAP.login[401]['User not found'],
      '401_disabled': ERROR_CODE_MAP.login[401] && ERROR_CODE_MAP.login[401]['Account disabled'],
      '401_default': ERROR_CODE_MAP.login[401] && ERROR_CODE_MAP.login[401]['default']
    };

    // 检查网络错误映射
    const networkRequirements = {
      'network_error': ERROR_CODE_MAP.network['NETWORK_ERROR'],
      'timeout': ERROR_CODE_MAP.network['TIMEOUT'],
      '500_error': ERROR_CODE_MAP.network[500],
      '503_error': ERROR_CODE_MAP.network[503]
    };

    // 检查表单验证错误映射
    const validationRequirements = {
      '400_email': ERROR_CODE_MAP.validation[400] && ERROR_CODE_MAP.validation[400]['email'],
      '400_password': ERROR_CODE_MAP.validation[400] && ERROR_CODE_MAP.validation[400]['password'],
      '409_email': ERROR_CODE_MAP.validation[409] && ERROR_CODE_MAP.validation[409]['email'],
      '422_default': ERROR_CODE_MAP.validation[422] && ERROR_CODE_MAP.validation[422]['default']
    };

    // 检查业务逻辑错误映射
    const businessRequirements = {
      '403_default': ERROR_CODE_MAP.business[403] && ERROR_CODE_MAP.business[403]['default'],
      '429_default': ERROR_CODE_MAP.business[429] && ERROR_CODE_MAP.business[429]['default'],
      '404_default': ERROR_CODE_MAP.business[404] && ERROR_CODE_MAP.business[404]['default'],
      '410_default': ERROR_CODE_MAP.business[410] && ERROR_CODE_MAP.business[410]['default']
    };

    // 汇总所有需求检查结果
    validation.requirementsCoverage = {
      login: loginRequirements,
      network: networkRequirements,
      validation: validationRequirements,
      business: businessRequirements
    };

    // 检查是否有未满足的需求
    for (const [category, requirements] of Object.entries(validation.requirementsCoverage)) {
      for (const [requirement, satisfied] of Object.entries(requirements)) {
        if (!satisfied) {
          validation.isValid = false;
          validation.missingMappings.push(`${requirement} (${category})`);
        }
      }
    }

    return validation;
  }

  /**
   * 获取映射表覆盖情况报告
   * @returns {string} 映射表覆盖情况的详细报告
   */
  getCoverageReport() {
    const validation = this.validateErrorCodeMap();
    let report = 'Error Code Mapping Coverage Report\n';
    report += '=====================================\n\n';

    if (validation.isValid) {
      report += '✅ All mappings are complete!\n\n';
    } else {
      report += '❌ Missing mappings:\n';
      validation.missingMappings.forEach(missing => {
        report += `  - ${missing}\n`;
      });
      report += '\n';
    }

    // 详细的映射覆盖情况
    for (const [category, requirements] of Object.entries(validation.requirementsCoverage)) {
      report += `${category.toUpperCase()} mappings:\n`;
      for (const [requirement, satisfied] of Object.entries(requirements)) {
        const status = satisfied ? '✅' : '❌';
        report += `  ${status} ${requirement}\n`;
      }
      report += '\n';
    }

    if (validation.warnings.length > 0) {
      report += '⚠️  Warnings:\n';
      validation.warnings.forEach(warning => {
        report += `  - ${warning}\n`;
      });
    }

    return report;
  }
}

// 创建单例实例
const errorCodeTranslator = new ErrorCodeTranslator();

export default errorCodeTranslator;