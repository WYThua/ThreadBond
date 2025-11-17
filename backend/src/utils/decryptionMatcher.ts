/**
 * 解密答案匹配工具
 * 支持模糊匹配、同义词匹配等高级功能
 */

export class DecryptionMatcher {
  /**
   * 验证解密答案
   * @param userAnswer 用户输入的答案
   * @param correctAnswer 正确答案
   * @param options 匹配选项
   */
  static async verifyAnswer(
    userAnswer: string, 
    correctAnswer: string, 
    options: MatchOptions = {}
  ): Promise<MatchResult> {
    const {
      fuzzyMatch = true,
      synonymMatch = true,
      ignoreCase = true,
      ignorePunctuation = true,
      ignoreSpaces = true,
      similarityThreshold = 0.8
    } = options;

    // 标准化输入
    const normalizedUser = this.normalizeText(userAnswer, {
      ignoreCase,
      ignorePunctuation,
      ignoreSpaces
    });
    
    const normalizedCorrect = this.normalizeText(correctAnswer, {
      ignoreCase,
      ignorePunctuation,
      ignoreSpaces
    });

    // 完全匹配
    if (normalizedUser === normalizedCorrect) {
      return {
        isMatch: true,
        confidence: 1.0,
        matchType: 'exact'
      };
    }

    // 模糊匹配
    if (fuzzyMatch) {
      const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
      if (similarity >= similarityThreshold) {
        return {
          isMatch: true,
          confidence: similarity,
          matchType: 'fuzzy'
        };
      }
    }

    // 同义词匹配
    if (synonymMatch) {
      const synonymResult = await this.checkSynonyms(normalizedUser, normalizedCorrect);
      if (synonymResult.isMatch) {
        return synonymResult;
      }
    }

    // 部分匹配（包含关键词）
    const partialResult = this.checkPartialMatch(normalizedUser, normalizedCorrect);
    if (partialResult.isMatch) {
      return partialResult;
    }

    return {
      isMatch: false,
      confidence: 0,
      matchType: 'none'
    };
  }

  /**
   * 文本标准化
   */
  private static normalizeText(text: string, options: NormalizeOptions): string {
    let normalized = text;

    if (options.ignoreCase) {
      normalized = normalized.toLowerCase();
    }

    if (options.ignoreSpaces) {
      normalized = normalized.replace(/\s+/g, '');
    }

    if (options.ignorePunctuation) {
      normalized = normalized.replace(/[^\w\u4e00-\u9fff]/g, '');
    }

    return normalized.trim();
  }

  /**
   * 计算字符串相似度（使用编辑距离算法）
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix: number[][] = [];

    // 初始化矩阵
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // 计算编辑距离
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // 删除
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    const editDistance = matrix[len1][len2];
    
    return (maxLen - editDistance) / maxLen;
  }

  /**
   * 检查同义词匹配
   */
  private static async checkSynonyms(userAnswer: string, correctAnswer: string): Promise<MatchResult> {
    // 简单的同义词词典（实际应用中可以使用更完善的词典或API）
    const synonyms: Record<string, string[]> = {
      '苹果': ['apple', '苹果手机', 'iphone'],
      '猫': ['cat', '猫咪', '小猫', '喵星人'],
      '狗': ['dog', '狗狗', '小狗', '汪星人'],
      '爱': ['love', '喜欢', '爱情', '恋爱'],
      '家': ['home', '房子', '住所', '居所'],
      '书': ['book', '书籍', '图书'],
      '车': ['car', '汽车', '轿车', '车辆'],
      '水': ['water', '水分', 'h2o'],
      '火': ['fire', '火焰', '燃烧'],
      '山': ['mountain', '高山', '山峰'],
      '海': ['sea', '大海', '海洋', 'ocean'],
      '天空': ['sky', '天', '蓝天'],
      '太阳': ['sun', '日', '阳光'],
      '月亮': ['moon', '月', '月球'],
      '星星': ['star', '星', '恒星']
    };

    // 检查用户答案是否是正确答案的同义词
    for (const [key, values] of Object.entries(synonyms)) {
      if (key === correctAnswer && values.includes(userAnswer)) {
        return {
          isMatch: true,
          confidence: 0.9,
          matchType: 'synonym'
        };
      }
      if (values.includes(correctAnswer) && (key === userAnswer || values.includes(userAnswer))) {
        return {
          isMatch: true,
          confidence: 0.9,
          matchType: 'synonym'
        };
      }
    }

    return {
      isMatch: false,
      confidence: 0,
      matchType: 'none'
    };
  }

  /**
   * 检查部分匹配
   */
  private static checkPartialMatch(userAnswer: string, correctAnswer: string): MatchResult {
    // 检查是否包含关键词
    if (correctAnswer.length >= 2 && userAnswer.includes(correctAnswer)) {
      return {
        isMatch: true,
        confidence: 0.7,
        matchType: 'partial'
      };
    }

    if (userAnswer.length >= 2 && correctAnswer.includes(userAnswer)) {
      return {
        isMatch: true,
        confidence: 0.6,
        matchType: 'partial'
      };
    }

    // 检查共同子串
    const commonSubstring = this.findLongestCommonSubstring(userAnswer, correctAnswer);
    if (commonSubstring.length >= Math.min(userAnswer.length, correctAnswer.length) * 0.6) {
      return {
        isMatch: true,
        confidence: 0.5,
        matchType: 'partial'
      };
    }

    return {
      isMatch: false,
      confidence: 0,
      matchType: 'none'
    };
  }

  /**
   * 查找最长公共子串
   */
  private static findLongestCommonSubstring(str1: string, str2: string): string {
    const len1 = str1.length;
    const len2 = str2.length;
    let maxLen = 0;
    let endPos = 0;

    const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          if (dp[i][j] > maxLen) {
            maxLen = dp[i][j];
            endPos = i;
          }
        }
      }
    }

    return str1.substring(endPos - maxLen, endPos);
  }

  /**
   * 生成智能提示
   */
  static generateHint(userAnswer: string, correctAnswer: string, attemptNumber: number): string {
    const hints = [
      `提示：答案包含 ${correctAnswer.length} 个字符`,
      `提示：答案的第一个字是 "${correctAnswer[0]}"`,
      `提示：答案的最后一个字是 "${correctAnswer[correctAnswer.length - 1]}"`,
      `提示：答案是 "${correctAnswer.substring(0, Math.ceil(correctAnswer.length / 2))}..."`,
      `提示：完整答案是 "${correctAnswer}"`
    ];

    const hintIndex = Math.min(attemptNumber - 1, hints.length - 1);
    return hints[hintIndex];
  }
}

// 类型定义
export interface MatchOptions {
  fuzzyMatch?: boolean;
  synonymMatch?: boolean;
  ignoreCase?: boolean;
  ignorePunctuation?: boolean;
  ignoreSpaces?: boolean;
  similarityThreshold?: number;
}

export interface NormalizeOptions {
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  ignoreSpaces: boolean;
}

export interface MatchResult {
  isMatch: boolean;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'synonym' | 'partial' | 'none';
}