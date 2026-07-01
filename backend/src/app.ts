import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db'
import { connectRedis } from './config/redis'
import { errorHandler } from './middleware/errorHandler'
import { createRateLimiters } from './middleware/rateLimiter'
import { logger } from './config/logger'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import generateRoutes from './routes/generate'
import libraryRoutes from './routes/library'
import resourceRoutes from './routes/resources'
import exportRoutes from './routes/export'
import { startLessonPlanWorker } from './workers/lessonPlanWorker'

const app = express()

const start = async (): Promise<void> => {
  await connectDB()
  await connectRedis()
  startLessonPlanWorker()

  const { apiLimiter, generateLimiter } = createRateLimiters()

  app.use(cors({ origin: process.env.CLIENT_URL }))
  app.use(express.json())

  app.use('/api/v1/auth', apiLimiter, authRoutes)
  app.use('/api/v1/users', apiLimiter, userRoutes)
  app.use('/api/v1/generate', generateLimiter, generateRoutes)
  app.use('/api/v1/library', apiLimiter, libraryRoutes)
  app.use('/api/v1/resources', apiLimiter, resourceRoutes)
  app.use('/api/v1/export', apiLimiter, exportRoutes)

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use(errorHandler)

  app.listen(process.env.PORT || 5000, () => {
    logger.info(`Server running on port ${process.env.PORT || 5000}`)
  })
}

start()
