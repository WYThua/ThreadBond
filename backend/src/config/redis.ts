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
    console.warn('⚠️  Redis 连接失败，将在无缓存模式下运行:', (error as Error).message);
    // 不抛出错误，允许应用在没有 Redis 的情况下运行
    return null;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    console.warn('Redis 客户端未初始化，返回 null');
    return null;
  }
  return redisClient;
}

// Redis 工具函数
export class RedisService {
  private get client() {
    const client = getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis 客户端不可用，操作将被跳过');
      return null;
    }
    return client;
  }

  // 设置缓存
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过设置缓存: ${key}`);
      return;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await client.setEx(key, expireInSeconds, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
    } catch (error) {
      console.error(`❌ Redis 设置缓存失败 (${key}):`, error);
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过获取缓存: ${key}`);
      return null;
    }
    
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`❌ Redis 获取缓存失败 (${key}):`, error);
      return null;
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过删除缓存: ${key}`);
      return;
    }
    
    try {
      await client.del(key);
    } catch (error) {
      console.error(`❌ Redis 删除缓存失败 (${key}):`, error);
    }
  }

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过检查键存在: ${key}`);
      return false;
    }
    
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Redis 检查键存在失败 (${key}):`, error);
      return false;
    }
  }

  // 设置过期时间
  async expire(key: string, seconds: number): Promise<void> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过设置过期时间: ${key}`);
      return;
    }
    
    try {
      await client.expire(key, seconds);
    } catch (error) {
      console.error(`❌ Redis 设置过期时间失败 (${key}):`, error);
    }
  }

  // 获取所有匹配的键
  async keys(pattern: string): Promise<string[]> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过获取键列表: ${pattern}`);
      return [];
    }
    
    try {
      return await client.keys(pattern);
    } catch (error) {
      console.error(`❌ Redis 获取键列表失败 (${pattern}):`, error);
      return [];
    }
  }

  // 哈希操作
  async hSet(key: string, field: string, value: any): Promise<void> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过哈希设置: ${key}.${field}`);
      return;
    }
    
    try {
      await client.hSet(key, field, JSON.stringify(value));
    } catch (error) {
      console.error(`❌ Redis 哈希设置失败 (${key}.${field}):`, error);
    }
  }

  async hGet<T>(key: string, field: string): Promise<T | null> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过哈希获取: ${key}.${field}`);
      return null;
    }
    
    try {
      const value = await client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`❌ Redis 哈希获取失败 (${key}.${field}):`, error);
      return null;
    }
  }

  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过哈希获取全部: ${key}`);
      return {};
    }
    
    try {
      const result = await client.hGetAll(key);
      const parsed: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(result)) {
        parsed[field] = JSON.parse(value);
      }
      
      return parsed;
    } catch (error) {
      console.error(`❌ Redis 哈希获取全部失败 (${key}):`, error);
      return {};
    }
  }

  // 列表操作
  async lPush(key: string, ...values: any[]): Promise<void> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过列表推入: ${key}`);
      return;
    }
    
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      await client.lPush(key, serializedValues);
    } catch (error) {
      console.error(`❌ Redis 列表推入失败 (${key}):`, error);
    }
  }

  async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过列表范围获取: ${key}`);
      return [];
    }
    
    try {
      const values = await client.lRange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      console.error(`❌ Redis 列表范围获取失败 (${key}):`, error);
      return [];
    }
  }

  async lPop<T>(key: string): Promise<T | null> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过列表弹出: ${key}`);
      return null;
    }
    
    try {
      const value = await client.lPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`❌ Redis 列表弹出失败 (${key}):`, error);
      return null;
    }
  }

  // 发布订阅
  async publish(channel: string, message: any): Promise<void> {
    const client = this.client;
    if (!client) {
      console.log(`⚠️ Redis 不可用，跳过发布消息: ${channel}`);
      return;
    }
    
    try {
      await client.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error(`❌ Redis 发布消息失败 (${channel}):`, error);
    }
  }

  // 创建订阅客户端
  createSubscriber() {
    return createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
  }
}

// 延迟初始化 Redis 服务
let redisServiceInstance: RedisService | null = null;

export function getRedisService(): RedisService {
  if (!redisServiceInstance) {
    redisServiceInstance = new RedisService();
  }
  return redisServiceInstance;
}