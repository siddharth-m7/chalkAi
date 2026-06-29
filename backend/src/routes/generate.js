import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { assignmentSchema } from '../utils/schemas/assignmentSchema.js'
import { generateAssignment, getAssignment, listAssignments } from '../controllers/assignmentController.js'

const router = Router()

router.use(protect)

router.post('/assignment', validate(assignmentSchema), generateAssignment)
router.get('/assignment', listAssignments)
router.get('/assignment/:id', getAssignment)

export default router
