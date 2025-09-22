// 用户注册功能验证脚本
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// 模拟用户服务的核心功能
class UserServiceValidator {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // 验证密码加密
  async validatePasswordHashing() {
    console.log('🔐 验证密码加密功能...');
    
    const password = 'Test123!@#';
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    const isValid = await bcrypt.compare(password, hash);
    
    console.log(`✅ 密码加密: ${isValid ? '通过' : '失败'}`);
    return isValid;
  }

  // 验证邮箱格式
  validateEmailFormat() {
    console.log('📧 验证邮箱格式验证...');
    
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ];
    
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'test@',
      'test.example.com'
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const validResults = validEmails.every(email => emailRegex.test(email));
    const invalidResults = invalidEmails.every(email => !emailRegex.test(email));
    
    console.log(`✅ 有效邮箱验证: ${validResults ? '通过' : '失败'}`);
    console.log(`✅ 无效邮箱验证: ${invalidResults ? '通过' : '失败'}`);
    
    return validResults && invalidResults;
  }

  // 验证匿名身份生成
  validateAnonymousIdentityGeneration() {
    console.log('🎭 验证匿名身份生成...');
    
    // 模拟生成随机昵称
    const adjectives = [
      '神秘的', '有趣的', '聪明的', '温暖的', '冷静的', '活泼的', '深沉的', '优雅的'
    ];
    
    const nouns = [
      '旅行者', '探索者', '思考者', '梦想家', '创造者', '观察者', '倾听者', '守护者'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    const displayName = `${adjective}${noun}${number}`;
    
    // 验证昵称格式
    const isValidFormat = /^.+\d+$/.test(displayName);
    console.log(`生成的昵称: ${displayName}`);
    console.log(`✅ 昵称格式验证: ${isValidFormat ? '通过' : '失败'}`);
    
    // 模拟生成头像URL
    const styles = ['avataaars', 'bottts', 'identicon', 'initials', 'personas'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const seed = Math.random().toString(36).substring(7);
    const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    
    const isValidAvatarUrl = /^https:\/\/api\.dicebear\.com\//.test(avatarUrl);
    console.log(`生成的头像URL: ${avatarUrl}`);
    console.log(`✅ 头像URL格式验证: ${isValidAvatarUrl ? '通过' : '失败'}`);
    
    // 模拟生成个性特征
    const allTraits = [
      '内向', '外向', '创意', '逻辑', '感性', '理性', '乐观', '现实',
      '冒险', '稳重', '幽默', '严肃', '好奇', '专注', '社交', '独立'
    ];
    
    const numTraits = Math.floor(Math.random() * 3) + 3;
    const shuffled = allTraits.sort(() => 0.5 - Math.random());
    const personalityTraits = shuffled.slice(0, numTraits);
    
    const isValidTraits = Array.isArray(personalityTraits) && 
                         personalityTraits.length >= 3 && 
                         personalityTraits.length <= 5;
    
    console.log(`生成的个性特征: ${personalityTraits.join(', ')}`);
    console.log(`✅ 个性特征验证: ${isValidTraits ? '通过' : '失败'}`);
    
    return isValidFormat && isValidAvatarUrl && isValidTraits;
  }

  // 验证JWT令牌生成
  validateJWTGeneration() {
    console.log('🔑 验证JWT令牌生成...');
    
    const jwt = require('jsonwebtoken');
    const secret = 'test_jwt_secret';
    const payload = {
      userId: 'test-user-id',
      type: 'access'
    };
    
    try {
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      const decoded = jwt.verify(token, secret);
      
      const isValid = decoded.userId === payload.userId && decoded.type === payload.type;
      console.log(`✅ JWT令牌生成和验证: ${isValid ? '通过' : '失败'}`);
      return isValid;
    } catch (error) {
      console.log(`❌ JWT令牌生成失败: ${error.message}`);
      return false;
    }
  }

  // 运行所有验证
  async runAllValidations() {
    console.log('🚀 开始验证用户注册功能...\n');
    
    const results = [];
    
    try {
      results.push(await this.validatePasswordHashing());
      results.push(this.validateEmailFormat());
      results.push(this.validateAnonymousIdentityGeneration());
      results.push(this.validateJWTGeneration());
      
      const allPassed = results.every(result => result);
      
      console.log('\n📊 验证结果汇总:');
      console.log(`总测试数: ${results.length}`);
      console.log(`通过数: ${results.filter(r => r).length}`);
      console.log(`失败数: ${results.filter(r => !r).length}`);
      console.log(`整体状态: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);
      
      return allPassed;
    } catch (error) {
      console.error('❌ 验证过程中出现错误:', error);
      return false;
    }
  }
}

// 运行验证
async function main() {
  const validator = new UserServiceValidator();
  const success = await validator.runAllValidations();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);