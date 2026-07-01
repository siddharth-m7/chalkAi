import { Worker, Job } from 'bullmq'
import { Types } from 'mongoose'
import { redisConnection } from '../config/bullmq'
import { generateWithAI, parseJsonFromAI } from '../services/aiService'
import { buildLessonPlanSystemPrompt, buildLessonPlanUserPrompt, LessonPlanInput } from '../utils/prompts/lessonPlanPrompt'
import GeneratedContent from '../models/GeneratedContent'
import { logger } from '../config/logger'

interface LessonPlanJobData {
  input: Record<string, unknown>
  userId: string
}

export const startLessonPlanWorker = (): Worker => {
  const worker = new Worker<LessonPlanJobData>(
    'lessonPlan',
    async (job: Job<LessonPlanJobData>) => {
      const { input, userId } = job.data

      const systemPrompt = buildLessonPlanSystemPrompt()
      const userPrompt   = buildLessonPlanUserPrompt(input as unknown as LessonPlanInput)

      const { text, provider } = await generateWithAI(systemPrompt, userPrompt)
      const parsed = parseJsonFromAI(text)

      const content = await GeneratedContent.create({
        userId: new Types.ObjectId(userId),
        type: 'lessonPlan',
        input,
        output: parsed,
        aiProvider: provider
      })

      return { contentId: content._id.toString() }
    },
    { connection: redisConnection }
  )

  worker.on('completed', (job: Job) => logger.info(`Lesson plan job ${job.id} completed`))
  worker.on('failed',    (job: Job | undefined, err: Error) =>
    logger.error(`Lesson plan job ${job?.id} failed: ${err.message}`)
  )

  logger.info('Lesson plan worker started')
  return worker
}
