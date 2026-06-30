import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { connectRedis } from './config/redis.js'
import { errorHandler } from './middleware/errorHandler.js'
import { createRateLimiters } from './middleware/rateLimiter.js'
import { logger } from './config/logger.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import generateRoutes from './routes/generate.js'
import libraryRoutes from './routes/library.js'
import resourceRoutes from './routes/resources.js'
import exportRoutes from './routes/export.js'
import { startLessonPlanWorker } from './workers/lessonPlanWorker.js'

const app = express()

const start = async () => {
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

  app.get('/health', (req, res) => res.json({ status: 'ok' }))

  app.use(errorHandler)

  app.listen(process.env.PORT || 5000, () => {
    logger.info(`Server running on port ${process.env.PORT || 5000}`)
  })
}

start()
