import { ClueRepository } from '../repositories/clueRepository';
import { 
  CreateClueRequest, 
  UpdateClueRequest, 
  ClueListQuery, 
  ClueResponse,
  DecryptionAttemptRequest,
  DecryptionResult
} from '../types/clue';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class ClueService {
  private clueRepository: ClueRepository;

  constructor(private prisma: PrismaClient) {
    this.clueRepository = new ClueRepository(prisma);
  }

  /**
   * 创建新线索
   */
  async createClue(creatorId: string, data: CreateClueRequest): Promise<ClueResponse> {
    // 验证创建者是否存在
    const creator = await this.prisma.anonymousIdentity.findUnique({
      where: { id: creatorId }
    });

    if (!creator) {
      throw new Error('创建者不存在');
    }

    // 验证线索内容
    this.validateClueContent(data);

    // 加密解密答案
    const hashedSolution = await bcrypt.hash(data.solution.toLowerCase().trim(), 10);
    
    const clueData = {
      ...data,
      solution: hashedSolution
    };

    const clue = await this.clueRepository.create(creatorId, clueData);
    
    return this.formatClueResponse(clue);
  }

  /**
   * 获取线索详情
   */
  async getClueById(id: string, userId?: string): Promise<ClueResponse | null> {
    const clue = await this.clueRepository.findById(id);
    
    if (!clue) {
      return null;
    }

    // 检查线索是否过期
    if (clue.expiresAt && clue.expiresAt < new Date()) {
      return null;
    }

    const response = this.formatClueResponse(clue);

    // 标记是否是用户自己创建的线索
    if (userId && clue.creatorId === userId) {
      (response as any).isOwnClue = true;
    } else {
      (response as any).isOwnClue = false;
    }

    return response;
  }

  /**
   * 获取线索列表
   */
  async getClues(query: ClueListQuery) {
    const result = await this.clueRepository.findMany(query);
    
    return {
      ...result,
      clues: result.clues.map(clue => this.formatClueResponse(clue))
    };
  }

  /**
   * 更新线索
   */
  async updateClue(id: string, creatorId: string, data: UpdateClueRequest): Promise<ClueResponse | null> {
    // 验证线索是否存在且属于当前用户
    const existingClue = await this.clueRepository.findById(id);
    
    if (!existingClue || existingClue.creatorId !== creatorId) {
      throw new Error('线索不存在或无权限修改');
    }

    // 如果更新解密答案，需要重新加密
    if (data.solution) {
      data.solution = await bcrypt.hash(data.solution.toLowerCase().trim(), 10);
    }

    const updatedClue = await this.clueRepository.update(id, data);
    
    if (!updatedClue) {
      return null;
    }

    return this.formatClueResponse(updatedClue);
  }

  /**
   * 删除线索
   */
  async deleteClue(id: string, creatorId: string): Promise<boolean> {
    // 验证线索是否存在且属于当前用户
    const existingClue = await this.clueRepository.findById(id);
    
    if (!existingClue || existingClue.creatorId !== creatorId) {
      throw new Error('线索不存在或无权限删除');
    }

    // 软删除（设置为不活跃）
    return await this.clueRepository.softDelete(id);
  }

  /**
   * 尝试解密线索
   */
  async attemptDecryption(
    userId: string, 
    clueId: string, 
    data: DecryptionAttemptRequest
  ): Promise<DecryptionResult> {
    // 获取线索信息
    const clue = await this.clueRepository.findById(clueId);
    
    if (!clue || !clue.isActive) {
      throw new Error('线索不存在或已失效');
    }

    // 检查是否过期
    if (clue.expiresAt && clue.expiresAt < new Date()) {
      throw new Error('线索已过期');
    }

    // 检查是否是自己的线索
    if (clue.creatorId === userId) {
      throw new Error('不能解密自己创建的线索');
    }

    // 检查是否已经成功解密过
    const alreadySolved = await this.clueRepository.hasUserSolvedClue(userId, clueId);
    if (alreadySolved) {
      throw new Error('您已经成功解密过这个线索');
    }

    // 获取用户的解密尝试历史
    const attempts = await this.clueRepository.getUserDecryptionAttempts(userId, clueId);
    const attemptNumber = attempts.length + 1;

    // 检查尝试次数限制（根据难度设置不同的限制）
    const maxAttempts = this.getMaxAttempts(clue.difficulty);
    if (attempts.length >= maxAttempts) {
      throw new Error(`已达到最大尝试次数限制 (${maxAttempts})`);
    }

    // 增加解密尝试计数
    await this.clueRepository.incrementDecryptionCount(clueId);

    // 验证答案
    const isCorrect = await this.verifyAnswer(data.answer, clue.solution);

    // 记录解密尝试
    await this.clueRepository.createDecryptionAttempt(userId, clueId, {
      ...data,
      isCorrect,
      attemptNumber
    });

    if (isCorrect) {
      // 增加成功解密计数
      await this.clueRepository.incrementSuccessfulDecryptions(clueId);

      // 创建聊天房间（这里先返回占位符，实际实现在聊天服务中）
      const chatRoomId = await this.createChatRoom(userId, clue.creatorId, clueId);

      return {
        success: true,
        message: '恭喜！解密成功！',
        chatRoomId
      };
    } else {
      const attemptsRemaining = maxAttempts - attemptNumber;
      const hints = this.getAvailableHints(clue, attemptNumber);

      return {
        success: false,
        message: attemptsRemaining > 0 ? `解密失败，还有 ${attemptsRemaining} 次机会` : '解密失败，已达到最大尝试次数',
        hintsAvailable: hints,
        attemptsRemaining
      };
    }
  }

  /**
   * 获取线索池（发现页面）
   */
  async getCluePool(query: any) {
    const clueQuery = {
      ...query,
      isActive: true,
      excludeExpired: true
    };

    if (query.excludeOwn && query.currentUserId) {
      clueQuery.excludeCreatorId = query.currentUserId;
    }

    const result = await this.clueRepository.findManyForPool(clueQuery);
    
    return {
      ...result,
      clues: result.clues.map(clue => this.formatClueResponse(clue))
    };
  }

  /**
   * 获取热门线索
   */
  async getTrendingClues(query: any) {
    const result = await this.clueRepository.findTrendingClues(query);
    
    return {
      ...result,
      clues: result.clues.map(clue => this.formatClueResponse(clue))
    };
  }

  /**
   * 获取线索分类和标签统计
   */
  async getClueCategories() {
    return await this.clueRepository.getCategoriesStats();
  }

  /**
   * 搜索线索
   */
  async searchClues(query: any) {
    const searchQuery = {
      ...query,
      isActive: true,
      excludeExpired: true
    };

    if (query.currentUserId) {
      searchQuery.excludeCreatorId = query.currentUserId;
    }

    const result = await this.clueRepository.searchClues(searchQuery);
    
    return {
      ...result,
      clues: result.clues.map(clue => this.formatClueResponse(clue))
    };
  }

  /**
   * 获取用户的解密统计
   */
  async getUserDecryptionStats(userId: string) {
    return await this.clueRepository.getUserDecryptionStats(userId);
  }

  /**
   * 验证线索内容
   */
  private validateClueContent(data: CreateClueRequest): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('线索标题不能为空');
    }

    if (!data.solution || data.solution.trim().length === 0) {
      throw new Error('解密答案不能为空');
    }

    if (!data.content || Object.keys(data.content).length === 0) {
      throw new Error('线索内容不能为空');
    }

    // 根据类型验证内容
    switch (data.type) {
      case 'TEXT':
        if (!data.content.text || data.content.text.trim().length === 0) {
          throw new Error('文字类型线索必须包含文字内容');
        }
        break;
      case 'IMAGE':
        if (!data.content.imageUrl) {
          throw new Error('图片类型线索必须包含图片URL');
        }
        break;
      case 'AUDIO':
        if (!data.content.audioUrl) {
          throw new Error('音频类型线索必须包含音频URL');
        }
        break;
      case 'VIDEO':
        if (!data.content.videoUrl) {
          throw new Error('视频类型线索必须包含视频URL');
        }
        break;
    }
  }

  /**
   * 验证解密答案
   */
  private async verifyAnswer(userAnswer: string, hashedSolution: string): Promise<boolean> {
    // 由于答案是加密存储的，我们需要先获取原始答案进行比较
    // 这里简化处理，实际应用中需要更安全的方式
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    return await bcrypt.compare(normalizedAnswer, hashedSolution);
  }

  /**
   * 根据难度获取最大尝试次数
   */
  private getMaxAttempts(difficulty: string): number {
    switch (difficulty) {
      case 'EASY':
        return 5;
      case 'MEDIUM':
        return 3;
      case 'HARD':
        return 2;
      default:
        return 3;
    }
  }

  /**
   * 获取可用提示
   */
  private getAvailableHints(clue: any, attemptNumber: number): string[] {
    if (!clue.hints || !Array.isArray(clue.hints)) {
      return [];
    }

    // 根据尝试次数逐步释放提示
    const hintsToShow = Math.min(attemptNumber - 1, clue.hints.length);
    return clue.hints.slice(0, hintsToShow);
  }

  /**
   * 创建聊天房间（占位符实现）
   */
  private async createChatRoom(userId: string, creatorId: string, clueId: string): Promise<string> {
    // 这里应该调用聊天服务来创建房间
    // 暂时返回一个占位符ID
    return `chat_${userId}_${creatorId}_${clueId}_${Date.now()}`;
  }

  /**
   * 格式化线索响应
   */
  private formatClueResponse(clue: any): ClueResponse {
    return {
      id: clue.id,
      title: clue.title,
      content: clue.content,
      type: clue.type,
      difficulty: clue.difficulty,
      hints: clue.hints,
      createdAt: clue.createdAt,
      expiresAt: clue.expiresAt,
      isActive: clue.isActive,
      decryptionCount: clue.decryptionCount,
      successfulDecryptions: clue.successfulDecryptions,
      tags: clue.tags,
      aiGenerated: clue.aiGenerated,
      creator: {
        id: clue.creator?.id || clue.creatorId,
        displayName: clue.creator?.displayName || '匿名用户',
        avatarUrl: clue.creator?.avatarUrl
      }
    };
  }
}