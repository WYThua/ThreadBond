// 线索相关类型定义

export enum ClueType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface ClueContent {
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  interactiveElements?: InteractiveElement[];
  [key: string]: any; // 添加索引签名以兼容 Prisma Json 类型
}

export interface InteractiveElement {
  type: string;
  data: any;
}

export interface CreateClueRequest {
  title: string;
  content: ClueContent;
  type: ClueType;
  difficulty: DifficultyLevel;
  solution: string;
  hints?: string[];
  tags?: string[];
  expiresAt?: Date;
}

export interface UpdateClueRequest {
  title?: string;
  content?: ClueContent;
  difficulty?: DifficultyLevel;
  solution?: string;
  hints?: string[];
  tags?: string[];
  isActive?: boolean;
  expiresAt?: Date;
}

export interface ClueResponse {
  id: string;
  title: string;
  content: ClueContent;
  type: ClueType;
  difficulty: DifficultyLevel;
  hints?: string[];
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  decryptionCount: number;
  successfulDecryptions: number;
  tags?: string[];
  aiGenerated: boolean;
  creator: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface DecryptionAttemptRequest {
  answer: string;
  hintsUsed?: number;
}

export interface DecryptionResult {
  success: boolean;
  message: string;
  chatRoomId?: string;
  hintsAvailable?: string[];
  attemptsRemaining?: number;
}

export interface ClueListQuery {
  page?: number;
  limit?: number;
  type?: ClueType;
  difficulty?: DifficultyLevel;
  tags?: string[];
  search?: string;
  creatorId?: string;
  isActive?: boolean;
}

export interface ClueListResponse {
  clues: ClueResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CluePoolQuery {
  page?: number;
  limit?: number;
  type?: ClueType;
  difficulty?: DifficultyLevel;
  tags?: string[];
  search?: string;
  sortBy?: 'latest' | 'popular' | 'difficulty';
  excludeOwn?: boolean;
  currentUserId?: string;
}

export interface TrendingCluesQuery {
  page?: number;
  limit?: number;
  timeRange?: '1d' | '7d' | '30d';
  currentUserId?: string;
}

export interface SearchCluesQuery {
  keyword: string;
  page?: number;
  limit?: number;
  type?: ClueType;
  difficulty?: DifficultyLevel;
  tags?: string[];
  sortBy?: 'relevance' | 'latest' | 'popular';
  currentUserId?: string;
}

export interface ClueCategories {
  types: Array<{
    type: ClueType;
    count: number;
  }>;
  difficulties: Array<{
    difficulty: DifficultyLevel;
    count: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}