import User from '../models/User.js'

export const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user })
}

export const updateProfile = async (req, res, next) => {
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

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}
