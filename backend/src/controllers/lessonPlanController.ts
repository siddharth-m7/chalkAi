import { Request, Response, NextFunction } from 'express'
import { lessonPlanQueue } from '../queues/lessonPlanQueue'
import GeneratedContent from '../models/GeneratedContent'

export const generateLessonPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await lessonPlanQueue.add(
      'generate',
      { input: req.body, userId: req.user._id.toString() },
      { attempts: 2, removeOnComplete: { age: 3600 }, removeOnFail: { age: 86400 } }
    )
    res.status(202).json({ success: true, jobId: job.id })
  } catch (err) {
    next(err)
  }
}

export const getLessonPlanStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await lessonPlanQueue.getJob(req.params.jobId as string)
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' })
      return
    }

    if (job.data.userId !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const state = await job.getState()

    if (state === 'completed') {
      const { contentId } = job.returnvalue as { contentId: string }
      const content = await GeneratedContent.findById(contentId)
      res.json({ success: true, status: 'completed', data: content })
      return
    }

    if (state === 'failed') {
      res.json({ success: true, status: 'failed', message: job.failedReason })
      return
    }

    res.json({ success: true, status: state })
  } catch (err) {
    next(err)
  }
}

export const getLessonPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const content = await GeneratedContent.findOne({
      _id:    req.params.id,
      userId: req.user._id,
      type:   'lessonPlan'
    })
    if (!content) {
      res.status(404).json({ success: false, message: 'Lesson plan not found' })
      return
    }
    res.json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const listLessonPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await GeneratedContent.find({ userId: req.user._id, type: 'lessonPlan' })
      .sort({ createdAt: -1 })
      .select('input output.title createdAt aiProvider')
    res.json({ success: true, data: plans })
  } catch (err) {
    next(err)
  }
}
