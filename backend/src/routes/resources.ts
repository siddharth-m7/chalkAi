import { Router } from 'express'
import { protect } from '../middleware/auth'
import { searchResources, fetchFromYouTube } from '../controllers/resourceController'

const router = Router()

router.use(protect)

router.get('/', searchResources)
router.post('/youtube', fetchFromYouTube)

export default router
