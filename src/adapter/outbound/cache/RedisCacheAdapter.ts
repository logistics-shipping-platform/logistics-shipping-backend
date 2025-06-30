import Redis from 'ioredis';
import { CachePort } from '../../../domain/port/outbound';


export class RedisCacheAdapter implements CachePort {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) as T : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const s = JSON.stringify(value);
    await this.client.set(key, s, 'EX', ttlSeconds);
  }
}