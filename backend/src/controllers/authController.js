import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profile: user.profile
})

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' })
    }

    const user = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({ success: true, token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = signToken(user._id)
    res.json({ success: true, token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

export const getMe = async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) })
}
