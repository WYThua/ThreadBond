import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis 连接错误:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis 连接建立');
    });

    redisClient.on('ready', () => {
      console.log('Redis 客户端就绪');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('Redis 初始化失败:', error);
    throw error;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis 客户端未初始化');
  }
  return redisClient;
}

// Redis 工具函数
export class RedisService {
  private client = getRedisClient();

  // 设置缓存
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // 设置过期时间
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // 获取所有匹配的键
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  // 哈希操作
  async hSet(key: string, field: string, value: any): Promise<void> {
    await this.client.hSet(key, field, JSON.stringify(value));
  }

  async hGet<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  }

  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    const result = await this.client.hGetAll(key);
    const parsed: Record<string, T> = {};
    
    for (const [field, value] of Object.entries(result)) {
      parsed[field] = JSON.parse(value);
    }
    
    return parsed;
  }

  // 列表操作
  async lPush(key: string, ...values: any[]): Promise<void> {
    const serializedValues = values.map(v => JSON.stringify(v));
    await this.client.lPush(key, serializedValues);
  }

  async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.client.lRange(key, start, stop);
    return values.map(v => JSON.parse(v));
  }

  // 发布订阅
  async publish(channel: string, message: any): Promise<void> {
    await this.client.publish(channel, JSON.stringify(message));
  }

  // 创建订阅客户端
  createSubscriber() {
    return createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
  }
}

export const redisService = new RedisService();