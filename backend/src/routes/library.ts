import { Router } from 'express'
import { protect } from '../middleware/auth'
import { saveToLibrary, listLibrary, updateLibraryItem, removeFromLibrary } from '../controllers/libraryController'

const router = Router()

router.use(protect)

router.post('/', saveToLibrary)
router.get('/', listLibrary)
router.patch('/:id', updateLibraryItem)
router.delete('/:id', removeFromLibrary)

export default router
