/**
 * 验证码服务
 * 用于管理邮箱验证码的生成、存储和验证
 */

interface VerificationCodeData {
  code: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

class VerificationCodeService {
  // 内存存储验证码（生产环境应该使用 Redis）
  private codes: Map<string, VerificationCodeData> = new Map();

  /**
   * 生成验证码
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 存储验证码
   */
  storeCode(email: string, code: string): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟过期

    this.codes.set(email.toLowerCase(), {
      code,
      email: email.toLowerCase(),
      createdAt: now,
      expiresAt
    });

    // 清理过期的验证码
    this.cleanupExpiredCodes();
  }

  /**
   * 验证验证码
   */
  verifyCode(email: string, code: string): boolean {
    const normalizedEmail = email.toLowerCase();
    const storedData = this.codes.get(normalizedEmail);

    if (!storedData) {
      return false;
    }

    // 检查是否过期
    if (new Date() > storedData.expiresAt) {
      this.codes.delete(normalizedEmail);
      return false;
    }

    // 验证码匹配
    if (storedData.code === code) {
      // 验证成功后删除验证码（一次性使用）
      this.codes.delete(normalizedEmail);
      return true;
    }

    return false;
  }

  /**
   * 检查验证码是否存在且未过期
   */
  hasValidCode(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    const storedData = this.codes.get(normalizedEmail);

    if (!storedData) {
      return false;
    }

    // 检查是否过期
    if (new Date() > storedData.expiresAt) {
      this.codes.delete(normalizedEmail);
      return false;
    }

    return true;
  }

  /**
   * 获取验证码剩余时间（秒）
   */
  getCodeRemainingTime(email: string): number {
    const normalizedEmail = email.toLowerCase();
    const storedData = this.codes.get(normalizedEmail);

    if (!storedData) {
      return 0;
    }

    const now = new Date();
    if (now > storedData.expiresAt) {
      this.codes.delete(normalizedEmail);
      return 0;
    }

    return Math.ceil((storedData.expiresAt.getTime() - now.getTime()) / 1000);
  }

  /**
   * 清理过期的验证码
   */
  private cleanupExpiredCodes(): void {
    const now = new Date();
    
    for (const [email, data] of this.codes.entries()) {
      if (now > data.expiresAt) {
        this.codes.delete(email);
      }
    }
  }

  /**
   * 删除验证码
   */
  deleteCode(email: string): void {
    this.codes.delete(email.toLowerCase());
  }

  /**
   * 获取存储的验证码数量（用于调试）
   */
  getStoredCodesCount(): number {
    this.cleanupExpiredCodes();
    return this.codes.size;
  }
}

export const verificationCodeService = new VerificationCodeService();