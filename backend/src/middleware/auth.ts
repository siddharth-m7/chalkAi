import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import User from '../models/User'

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      res.status(401).json({ success: false, message: 'User no longer exists' })
      return
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
