import { Response } from 'express'

export const sendSuccess = (res: Response, data: Record<string, unknown>, statusCode = 200): Response =>
  res.status(statusCode).json({ success: true, ...data })

export const sendError = (res: Response, message: string, statusCode = 400): Response =>
  res.status(statusCode).json({ success: false, message })
