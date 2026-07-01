import { Router } from 'express'
import { protect } from '../middleware/auth'
import { saveToLibrary, listLibrary, removeFromLibrary } from '../controllers/libraryController'

const router = Router()

router.use(protect)

router.post('/', saveToLibrary)
router.get('/', listLibrary)
router.delete('/:id', removeFromLibrary)

export default router
