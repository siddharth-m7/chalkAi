import { Router } from 'express'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { assignmentSchema } from '../utils/schemas/assignmentSchema'
import { lessonPlanSchema } from '../utils/schemas/lessonPlanSchema'
import { conceptSchema } from '../utils/schemas/conceptSchema'
import { generateAssignment, getAssignment, listAssignments } from '../controllers/assignmentController'
import { generateLessonPlan, getLessonPlanStatus, getLessonPlan, listLessonPlans } from '../controllers/lessonPlanController'
import { explainConcept, getConcept, listConcepts } from '../controllers/conceptController'

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

// Concept Explainer
router.post('/concept', validate(conceptSchema), explainConcept)
router.get('/concept', listConcepts)
router.get('/concept/:id', getConcept)

export default router
