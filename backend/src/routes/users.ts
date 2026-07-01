import { Router } from 'express'
import { getProfile, updateProfile, changePassword } from '../controllers/userController'
import { protect } from '../middleware/auth'

const router = Router()

router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)

export default router
