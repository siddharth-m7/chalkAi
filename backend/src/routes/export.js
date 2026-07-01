import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { exportPDF, exportDOCX } from '../controllers/exportController.js'

const router = Router()

router.use(protect)

router.post('/pdf', exportPDF)
router.post('/docx', exportDOCX)

export default router
