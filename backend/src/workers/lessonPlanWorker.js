import { Worker } from 'bullmq'
import { redisConnection } from '../config/bullmq.js'
import { generateWithAI, parseJsonFromAI } from '../services/aiService.js'
import { buildLessonPlanSystemPrompt, buildLessonPlanUserPrompt } from '../utils/prompts/lessonPlanPrompt.js'
import GeneratedContent from '../models/GeneratedContent.js'
import { logger } from '../config/logger.js'

export const startLessonPlanWorker = () => {
  const worker = new Worker(
    'lessonPlan',
    async (job) => {
      const { input, userId } = job.data

      const systemPrompt = buildLessonPlanSystemPrompt()
      const userPrompt = buildLessonPlanUserPrompt(input)

      const { text, provider } = await generateWithAI(systemPrompt, userPrompt)
      const parsed = parseJsonFromAI(text)

      const content = await GeneratedContent.create({
        userId,
        type: 'lessonPlan',
        input,
        output: parsed,
        aiProvider: provider
      })

      return { contentId: content._id.toString() }
    },
    { connection: redisConnection }
  )

  worker.on('completed', (job) => logger.info(`Lesson plan job ${job.id} completed`))
  worker.on('failed', (job, err) => logger.error(`Lesson plan job ${job.id} failed: ${err.message}`))

  logger.info('Lesson plan worker started')
  return worker
}
