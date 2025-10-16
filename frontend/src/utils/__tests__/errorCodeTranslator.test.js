/**
 * 错误码转换器测试 - 英文错误消息版本
 */
import errorCodeTranslator from '../errorCodeTranslator';

describe('ErrorCodeTranslator', () => {
  describe('translateLoginError', () => {
    test('应该正确转换密码错误', () => {
      const result = errorCodeTranslator.translateLoginError(401, 'Invalid password');
      expect(result).toBe('Invalid password');
    });

    test('应该正确转换用户不存在错误', () => {
      const result = errorCodeTranslator.translateLoginError(401, 'User not found');
      expect(result).toBe('User not found');
    });

    test('应该正确转换账户禁用错误', () => {
      const result = errorCodeTranslator.translateLoginError(401, 'Account disabled');
      expect(result).toBe('Account disabled');
    });

    test('应该返回默认登录错误消息', () => {
      const result = errorCodeTranslator.translateLoginError(401, 'Unknown error');
      expect(result).toBe('Invalid email or password');
    });
  });

  describe('translateNetworkError', () => {
    test('应该正确处理网络连接失败', () => {
      const error = { message: 'Network Error' };
      const result = errorCodeTranslator.translateNetworkError(error);
      expect(result).toBe('Network Error');
    });

    test('应该正确处理超时错误', () => {
      const error = { 
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
        response: { status: 408 }
      };
      const result = errorCodeTranslator.translateNetworkError(error);
      expect(result).toBe('Request Timeout');
    });

    test('应该正确处理500错误', () => {
      const error = { 
        response: { status: 500 },
        message: 'Internal Server Error'
      };
      const result = errorCodeTranslator.translateNetworkError(error);
      expect(result).toBe('Internal Server Error');
    });

    test('应该正确处理503错误', () => {
      const error = { 
        response: { status: 503 },
        message: 'Service Unavailable'
      };
      const result = errorCodeTranslator.translateNetworkError(error);
      expect(result).toBe('Service Unavailable');
    });
  });

  describe('translateValidationError', () => {
    test('应该正确转换邮箱格式错误', () => {
      const result = errorCodeTranslator.translateValidationError(400, { email: 'invalid' });
      expect(result).toBe('Invalid email format');
    });

    test('应该正确转换密码格式错误', () => {
      const result = errorCodeTranslator.translateValidationError(400, { password: 'weak' });
      expect(result).toBe('Invalid password format');
    });

    test('应该正确转换邮箱重复错误（通过字段）', () => {
      const result = errorCodeTranslator.translateValidationError(409, { email: 'exists' });
      expect(result).toBe('Email already exists');
    });

    test('应该正确转换邮箱重复错误（通过消息）', () => {
      const result = errorCodeTranslator.translateValidationError(409, {}, 'Email already exists');
      expect(result).toBe('Email already exists');
    });

    test('应该正确转换422错误', () => {
      const result = errorCodeTranslator.translateValidationError(422, {});
      expect(result).toBe('Unprocessable Entity');
    });

    test('应该正确转换用户名重复错误', () => {
      const result = errorCodeTranslator.translateValidationError(409, { username: 'exists' });
      expect(result).toBe('Username already exists');
    });

    test('应该返回默认409错误消息', () => {
      const result = errorCodeTranslator.translateValidationError(409, { other: 'exists' });
      expect(result).toBe('Conflict');
    });
  });

  describe('translateBusinessError', () => {
    test('应该正确转换403权限错误（默认）', () => {
      const result = errorCodeTranslator.translateBusinessError(403);
      expect(result).toBe('Forbidden');
    });

    test('应该正确转换403权限错误（具体消息）', () => {
      const result = errorCodeTranslator.translateBusinessError(403, 'access_denied');
      expect(result).toBe('Access Denied');
    });

    test('应该正确转换404错误（默认）', () => {
      const result = errorCodeTranslator.translateBusinessError(404);
      expect(result).toBe('Not Found');
    });

    test('应该正确转换404错误（用户不存在）', () => {
      const result = errorCodeTranslator.translateBusinessError(404, 'user_not_found');
      expect(result).toBe('User Not Found');
    });

    test('应该正确转换429频率限制错误', () => {
      const result = errorCodeTranslator.translateBusinessError(429, 'rate_limit_exceeded');
      expect(result).toBe('Rate Limit Exceeded');
    });

    test('应该正确转换410过期错误', () => {
      const result = errorCodeTranslator.translateBusinessError(410, 'token_expired');
      expect(result).toBe('Token Expired');
    });
  });

  describe('translate', () => {
    test('应该根据上下文正确转换登录错误', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid password' }
        }
      };
      const result = errorCodeTranslator.translate(error, 'login');
      expect(result).toBe('Invalid password');
    });

    test('应该根据上下文正确转换注册错误', () => {
      const error = {
        response: {
          status: 409,
          data: { errors: { email: 'already exists' } }
        }
      };
      const result = errorCodeTranslator.translate(error, 'register');
      expect(result).toBe('Email already exists');
    });

    test('应该正确处理网络错误', () => {
      const error = { message: 'Network Error' };
      const result = errorCodeTranslator.translate(error, 'network');
      expect(result).toBe('Network Error');
    });
  });

  describe('translateSpecialError', () => {
    test('应该正确转换TOKEN_EXPIRED错误', () => {
      const result = errorCodeTranslator.translateSpecialError('TOKEN_EXPIRED');
      expect(result).toBe('Token Expired');
    });

    test('应该正确转换FILE_TOO_LARGE错误', () => {
      const result = errorCodeTranslator.translateSpecialError('FILE_TOO_LARGE');
      expect(result).toBe('File Too Large');
    });

    test('应该返回默认特殊错误消息', () => {
      const result = errorCodeTranslator.translateSpecialError('UNKNOWN_ERROR');
      expect(result).toBe('System Error');
    });
  });

  describe('getSupportedErrorCodes', () => {
    test('应该返回所有支持的错误码', () => {
      const result = errorCodeTranslator.getSupportedErrorCodes();
      
      expect(result).toHaveProperty('login');
      expect(result).toHaveProperty('network');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('business');
      expect(result).toHaveProperty('special');
      
      expect(result.login).toContain('401');
      expect(result.network).toContain('500');
      expect(result.validation).toContain('400');
      expect(result.business).toContain('403');
    });
  });

  describe('validateErrorCodeMap', () => {
    test('应该验证错误码映射表的完整性', () => {
      const result = errorCodeTranslator.validateErrorCodeMap();
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('missingMappings');
      expect(result).toHaveProperty('warnings');
      
      // 由于我们已经实现了完整的映射表，应该是有效的
      expect(result.isValid).toBe(true);
      expect(result.missingMappings).toHaveLength(0);
    });
  });

  describe('extractErrorInfo', () => {
    test('应该正确提取网络错误信息', () => {
      const error = { message: 'Network Error', code: 'ERR_NETWORK' };
      const result = errorCodeTranslator.extractErrorInfo(error);
      
      expect(result.isNetworkError).toBe(true);
      expect(result.statusCode).toBe(null);
      expect(result.message).toBe('Network Error');
      expect(result.errorType).toBe('ERR_NETWORK');
    });

    test('应该正确提取HTTP错误信息', () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: { email: 'invalid format' },
            type: 'VALIDATION_ERROR'
          }
        },
        message: 'Request failed'
      };
      
      const result = errorCodeTranslator.extractErrorInfo(error);
      
      expect(result.isNetworkError).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Validation failed');
      expect(result.fieldErrors).toEqual({ email: 'invalid format' });
      expect(result.errorType).toBe('VALIDATION_ERROR');
    });
  });

  describe('登录错误的详细测试', () => {
    test('应该正确转换各种密码错误消息', () => {
      expect(errorCodeTranslator.translateLoginError(401, 'Wrong password')).toBe('Wrong password');
      expect(errorCodeTranslator.translateLoginError(401, 'Password incorrect')).toBe('Password incorrect');
      expect(errorCodeTranslator.translateLoginError(401, 'password')).toBe('Invalid password');
    });

    test('应该正确转换各种用户不存在消息', () => {
      expect(errorCodeTranslator.translateLoginError(401, 'User does not exist')).toBe('User does not exist');
      expect(errorCodeTranslator.translateLoginError(401, 'No such user')).toBe('No such user');
      expect(errorCodeTranslator.translateLoginError(401, 'user not found')).toBe('User not found');
    });

    test('应该正确转换各种账户禁用消息', () => {
      expect(errorCodeTranslator.translateLoginError(401, 'Account suspended')).toBe('Account suspended');
      expect(errorCodeTranslator.translateLoginError(401, 'User disabled')).toBe('User disabled');
      expect(errorCodeTranslator.translateLoginError(401, 'account disabled')).toBe('Account disabled');
    });
  });

  describe('网络错误的详细测试', () => {
    test('应该正确转换各种网络连接错误', () => {
      expect(errorCodeTranslator.translateNetworkError({ code: 'ERR_NETWORK' })).toBe('Network Error');
      expect(errorCodeTranslator.translateNetworkError({ code: 'ERR_INTERNET_DISCONNECTED' })).toBe('Network Error');
      expect(errorCodeTranslator.translateNetworkError({ code: 'ERR_CONNECTION_REFUSED' })).toBe('Connection Refused');
    });

    test('应该正确转换各种超时错误', () => {
      expect(errorCodeTranslator.translateNetworkError({ code: 'ERR_TIMEOUT' })).toBe('Request Timeout');
      expect(errorCodeTranslator.translateNetworkError({ code: 'ERR_CONNECTION_TIMED_OUT' })).toBe('Connection Timeout');
      expect(errorCodeTranslator.translateNetworkError({ message: 'timeout exceeded' })).toBe('Request Timeout');
    });
  });
});