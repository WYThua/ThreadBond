import { PrismaClient, Clue, DecryptionAttempt } from '@prisma/client';
import { 
  CreateClueRequest, 
  UpdateClueRequest, 
  ClueListQuery,
  DecryptionAttemptRequest 
} from '../types/clue';

export class ClueRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 创建新线索
   */
  async create(creatorId: string, data: CreateClueRequest): Promise<Clue> {
    return await this.prisma.clue.create({
      data: {
        creatorId,
        title: data.title,
        content: data.content as any, // 类型断言以兼容 Prisma Json 类型
        type: data.type,
        difficulty: data.difficulty,
        solution: data.solution, // 注意：在实际应用中应该加密存储
        hints: data.hints || [],
        tags: data.tags || [],
        expiresAt: data.expiresAt,
        aiGenerated: false
      }
    });
  }

  /**
   * 根据ID获取线索
   */
  async findById(id: string): Promise<Clue | null> {
    return await this.prisma.clue.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  /**
   * 获取线索列表（分页）
   */
  async findMany(query: ClueListQuery) {
    const {
      page = 1,
      limit = 20,
      type,
      difficulty,
      tags,
      search,
      creatorId,
      isActive = true
    } = query;

    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {
      isActive
    };

    if (type) {
      where.type = type;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        array_contains: tags
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { path: ['text'], string_contains: search } }
      ];
    }

    // 检查是否过期
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ];

    const [clues, total] = await Promise.all([
      this.prisma.clue.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.clue.count({ where })
    ]);

    return {
      clues,
      total,
      page,
      limit,
      hasMore: skip + clues.length < total
    };
  }

  /**
   * 更新线索
   */
  async update(id: string, data: UpdateClueRequest): Promise<Clue | null> {
    try {
      return await this.prisma.clue.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.content && { content: data.content as any }),
          ...(data.difficulty && { difficulty: data.difficulty }),
          ...(data.solution && { solution: data.solution }),
          ...(data.hints && { hints: data.hints }),
          ...(data.tags && { tags: data.tags }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.expiresAt && { expiresAt: data.expiresAt })
        }
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * 删除线索
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.clue.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 软删除线索（设置为不活跃）
   */
  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.clue.update({
        where: { id },
        data: { isActive: false }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 增加解密尝试计数
   */
  async incrementDecryptionCount(id: string): Promise<void> {
    await this.prisma.clue.update({
      where: { id },
      data: {
        decryptionCount: {
          increment: 1
        }
      }
    });
  }

  /**
   * 增加成功解密计数
   */
  async incrementSuccessfulDecryptions(id: string): Promise<void> {
    await this.prisma.clue.update({
      where: { id },
      data: {
        successfulDecryptions: {
          increment: 1
        }
      }
    });
  }

  /**
   * 创建解密尝试记录
   */
  async createDecryptionAttempt(
    userId: string, 
    clueId: string, 
    data: DecryptionAttemptRequest & { isCorrect: boolean; attemptNumber: number }
  ): Promise<DecryptionAttempt> {
    return await this.prisma.decryptionAttempt.create({
      data: {
        userId,
        clueId,
        answer: data.answer,
        isCorrect: data.isCorrect,
        hintsUsed: data.hintsUsed || 0,
        attemptNumber: data.attemptNumber
      }
    });
  }

  /**
   * 获取用户对特定线索的解密尝试记录
   */
  async getUserDecryptionAttempts(userId: string, clueId: string): Promise<DecryptionAttempt[]> {
    return await this.prisma.decryptionAttempt.findMany({
      where: {
        userId,
        clueId
      },
      orderBy: { attemptedAt: 'desc' }
    });
  }

  /**
   * 获取用户的解密历史统计
   */
  async getUserDecryptionStats(userId: string) {
    const [totalAttempts, successfulAttempts] = await Promise.all([
      this.prisma.decryptionAttempt.count({
        where: { userId }
      }),
      this.prisma.decryptionAttempt.count({
        where: { 
          userId,
          isCorrect: true 
        }
      })
    ]);

    return {
      totalAttempts,
      successfulAttempts,
      successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0
    };
  }

  /**
   * 检查用户是否已成功解密某个线索
   */
  async hasUserSolvedClue(userId: string, clueId: string): Promise<boolean> {
    const attempt = await this.prisma.decryptionAttempt.findFirst({
      where: {
        userId,
        clueId,
        isCorrect: true
      }
    });

    return !!attempt;
  }

  /**
   * 获取线索池（用于发现页面）
   */
  async findManyForPool(query: any) {
    const {
      page = 1,
      limit = 20,
      type,
      difficulty,
      tags,
      search,
      sortBy = 'latest',
      excludeCreatorId,
      isActive = true,
      excludeExpired = true
    } = query;

    const skip = (page - 1) * limit;
    
    const where: any = {
      isActive
    };

    if (excludeCreatorId) {
      where.creatorId = {
        not: excludeCreatorId
      };
    }

    if (type) {
      where.type = type;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        array_contains: tags
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } }
      ];
    }

    if (excludeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };

    switch (sortBy) {
      case 'popular':
        orderBy = [
          { successfulDecryptions: 'desc' },
          { decryptionCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'difficulty':
        orderBy = [
          { difficulty: 'asc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [clues, total] = await Promise.all([
      this.prisma.clue.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.clue.count({ where })
    ]);

    return {
      clues,
      total,
      page,
      limit,
      hasMore: skip + clues.length < total
    };
  }

  /**
   * 获取热门线索
   */
  async findTrendingClues(query: any) {
    const {
      page = 1,
      limit = 10,
      timeRange = '7d',
      currentUserId
    } = query;

    const skip = (page - 1) * limit;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const where: any = {
      isActive: true
    };

    // 只在指定了时间范围时才添加时间限制
    // 默认不限制时间，显示所有热门线索
    if (timeRange && timeRange !== 'all') {
      where.createdAt = {
        gte: startDate
      };
    }

    if (currentUserId) {
      where.creatorId = {
        not: currentUserId
      };
    }

    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ];

    const [clues, total] = await Promise.all([
      this.prisma.clue.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: [
          { successfulDecryptions: 'desc' },
          { decryptionCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.clue.count({ where })
    ]);

    return {
      clues,
      total,
      page,
      limit,
      hasMore: skip + clues.length < total
    };
  }

  /**
   * 获取线索分类和标签统计
   */
  async getCategoriesStats() {
    const typeStats = await this.prisma.clue.groupBy({
      by: ['type'],
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      _count: {
        id: true
      }
    });

    const difficultyStats = await this.prisma.clue.groupBy({
      by: ['difficulty'],
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      _count: {
        id: true
      }
    });

    const cluesWithTags = await this.prisma.clue.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ],
        tags: {
          not: []
        }
      },
      select: {
        tags: true
      }
    });

    const tagCounts: { [key: string]: number } = {};
    cluesWithTags.forEach(clue => {
      if (Array.isArray(clue.tags)) {
        clue.tags.forEach(tag => {
          if (typeof tag === 'string') {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return {
      types: typeStats.map(stat => ({
        type: stat.type,
        count: stat._count.id
      })),
      difficulties: difficultyStats.map(stat => ({
        difficulty: stat.difficulty,
        count: stat._count.id
      })),
      popularTags
    };
  }

  /**
   * 搜索线索
   */
  async searchClues(query: any) {
    const {
      keyword,
      page = 1,
      limit = 20,
      type,
      difficulty,
      tags,
      sortBy = 'relevance',
      excludeCreatorId,
      isActive = true,
      excludeExpired = true
    } = query;

    const skip = (page - 1) * limit;
    
    const where: any = {
      isActive
    };

    if (excludeCreatorId) {
      where.creatorId = {
        not: excludeCreatorId
      };
    }

    if (type) {
      where.type = type;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        array_contains: tags
      };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { tags: { array_contains: [keyword] } }
      ];
    }

    if (excludeExpired) {
      where.AND = [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };

    switch (sortBy) {
      case 'popular':
        orderBy = [
          { successfulDecryptions: 'desc' },
          { decryptionCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'latest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'relevance':
      default:
        orderBy = [
          { decryptionCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    const [clues, total] = await Promise.all([
      this.prisma.clue.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.clue.count({ where })
    ]);

    return {
      clues,
      total,
      page,
      limit,
      hasMore: skip + clues.length < total,
      keyword
    };
  }
}