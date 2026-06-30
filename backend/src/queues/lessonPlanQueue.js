import { Queue } from 'bullmq'
import { redisConnection } from '../config/bullmq.js'

export const lessonPlanQueue = new Queue('lessonPlan', { connection: redisConnection })
