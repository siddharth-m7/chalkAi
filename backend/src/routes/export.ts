import { Router } from 'express'
import { protect } from '../middleware/auth'
import { exportPDF, exportDOCX } from '../controllers/exportController'

const router = Router()

router.use(protect)

router.post('/pdf', exportPDF)
router.post('/docx', exportDOCX)

export default router
