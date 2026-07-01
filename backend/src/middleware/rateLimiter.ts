import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { Request, Response, NextFunction } from 'express'
import { redis } from '../config/redis'

type Middleware = (req: Request, res: Response, next: NextFunction) => void

interface RateLimiters {
  apiLimiter: RateLimitRequestHandler | Middleware
  generateLimiter: RateLimitRequestHandler | Middleware
}

const isDev = process.env.NODE_ENV === 'development'
const passThrough: Middleware = (_req, _res, next) => next()

export const createRateLimiters = (): RateLimiters => {
  if (isDev) return { apiLimiter: passThrough, generateLimiter: passThrough }

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({ sendCommand: (...args: string[]) => redis.sendCommand(args) }),
    message: { success: false, message: 'Too many requests, please try again later.' }
  })

  const generateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({ sendCommand: (...args: string[]) => redis.sendCommand(args) }),
    message: { success: false, message: 'Generation limit reached. Try again in an hour.' }
  })

  return { apiLimiter, generateLimiter }
}
