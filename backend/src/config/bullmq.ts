const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379')

export const redisConnection = {
  host: url.hostname,
  port: parseInt(url.port || '6379')
}
