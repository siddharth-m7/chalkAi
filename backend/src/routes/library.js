import { Router } from 'express'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

export default router
