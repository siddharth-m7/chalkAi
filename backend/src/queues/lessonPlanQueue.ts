import { Queue } from 'bullmq'
import { redisConnection } from '../config/bullmq'

export const lessonPlanQueue = new Queue('lessonPlan', { connection: redisConnection })
