import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { saveToLibrary, listLibrary, removeFromLibrary } from '../controllers/libraryController.js'

const router = Router()

router.use(protect)

router.post('/', saveToLibrary)
router.get('/', listLibrary)
router.delete('/:id', removeFromLibrary)

export default router
