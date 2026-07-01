import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import User, { IUser } from '../models/User'

const signToken = (id: unknown): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] })

const sanitizeUser = (user: IUser) => ({
  id:      user._id,
  name:    user.name,
  email:   user.email,
  profile: user.profile
})

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already in use' })
      return
    }

    const user  = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({ success: true, token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    const token = signToken(user._id)
    res.json({ success: true, token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

export const getMe = (req: Request, res: Response): void => {
  res.json({ success: true, user: sanitizeUser(req.user) })
}
