let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const { Redis } = require('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('Upstash Redis connected');
  } catch (err) {
    console.warn('Upstash Redis init failed (caching disabled):', err.message);
    redis = null;
  }
} else if (process.env.REDIS_URL) {
  const Redis = require('ioredis');
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.warn('Redis connection error (caching disabled):', err.message);
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });

    redis.connect().catch((err) => {
      console.warn('Redis connect failed (caching disabled):', err.message);
      redis = null;
    });
  } catch (err) {
    console.warn('Redis init failed (caching disabled):', err.message);
    redis = null;
  }
} else {
  console.log('No Redis URL configured — caching disabled');
}

const CACHE_TTL = 300;

function isReady() {
  return redis !== null;
}

async function getChannelMessages(channelId) {
  if (!isReady()) return null;
  try {
    const key = `channel:${channelId}:messages`;
    const cached = await redis.get(key);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function setChannelMessages(channelId, messages) {
  if (!isReady()) return;
  try {
    const key = `channel:${channelId}:messages`;
    if (redis.setex) {
      await redis.setex(key, CACHE_TTL, JSON.stringify(messages));
    } else if (redis.set) {
      await redis.set(key, JSON.stringify(messages), { ex: CACHE_TTL });
    }
  } catch (err) {
  }
}

async function invalidateChannelCache(channelId) {
  if (!isReady()) return;
  try {
    const key = `channel:${channelId}:messages`;
    await redis.del(key);
  } catch (err) {
  }
}

async function cacheAIResult(key, data, ttl = 300) {
  if (!isReady()) return;
  try {
    const cacheKey = `ai:${key}`;
    if (redis.setex) {
      await redis.setex(cacheKey, ttl, JSON.stringify(data));
    } else if (redis.set) {
      await redis.set(cacheKey, JSON.stringify(data), { ex: ttl });
    }
  } catch (err) {
  }
}

async function getCachedAIResult(key) {
  if (!isReady()) return null;
  try {
    const cacheKey = `ai:${key}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }
    return null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getChannelMessages,
  setChannelMessages,
  invalidateChannelCache,
  cacheAIResult,
  getCachedAIResult,
};
