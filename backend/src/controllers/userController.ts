import { Request, Response, NextFunction } from 'express'
import User from '../models/User'

export const getProfile = (req: Request, res: Response): void => {
  res.json({ success: true, user: req.user })
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, profile } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profile },
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' })
      return
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}
