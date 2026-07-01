import mongoose from 'mongoose'
import { logger } from './logger'

export const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(process.env.MONGODB_URI)
  logger.info(`MongoDB connected: ${conn.connection.host}`)
}
