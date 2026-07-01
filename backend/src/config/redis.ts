import { createClient } from 'redis'
import { logger } from './logger'

export const redis = createClient({ url: process.env.REDIS_URL })

redis.on('error', (err: Error) => logger.error(`Redis error: ${err.message}`))

export const connectRedis = async (): Promise<void> => {
  await redis.connect()
  logger.info('Redis connected')
}
