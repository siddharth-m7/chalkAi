import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger'

interface AppError extends Error {
  statusCode?: number
  code?: number
  keyValue?: Record<string, string>
  errors?: Record<string, { message: string }>
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`)

  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message)
    res.status(400).json({ success: false, message: messages.join(', ') })
    return
  }

  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0]
    res.status(400).json({ success: false, message: `${field} already exists` })
    return
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' })
    return
  }

  const status = err.statusCode ?? 500
  res.status(status).json({ success: false, message: err.message || 'Server error' })
}
