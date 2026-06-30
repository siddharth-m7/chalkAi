import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { assignmentSchema } from '../utils/schemas/assignmentSchema.js'
import { lessonPlanSchema } from '../utils/schemas/lessonPlanSchema.js'
import { generateAssignment, getAssignment, listAssignments } from '../controllers/assignmentController.js'
import { generateLessonPlan, getLessonPlanStatus, getLessonPlan, listLessonPlans } from '../controllers/lessonPlanController.js'

const router = Router()

router.use(protect)

// Assignment
router.post('/assignment', validate(assignmentSchema), generateAssignment)
router.get('/assignment', listAssignments)
router.get('/assignment/:id', getAssignment)

// Lesson Plan
router.post('/lesson-plan', validate(lessonPlanSchema), generateLessonPlan)
router.get('/lesson-plan/status/:jobId', getLessonPlanStatus)
router.get('/lesson-plan', listLessonPlans)
router.get('/lesson-plan/:id', getLessonPlan)

export default router
