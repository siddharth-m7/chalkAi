import { lessonPlanQueue } from '../queues/lessonPlanQueue.js'
import GeneratedContent from '../models/GeneratedContent.js'

export const generateLessonPlan = async (req, res, next) => {
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

export const getLessonPlanStatus = async (req, res, next) => {
  try {
    const job = await lessonPlanQueue.getJob(req.params.jobId)
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.data.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const state = await job.getState()

    if (state === 'completed') {
      const { contentId } = job.returnvalue
      const content = await GeneratedContent.findById(contentId)
      return res.json({ success: true, status: 'completed', data: content })
    }

    if (state === 'failed') {
      return res.json({ success: true, status: 'failed', message: job.failedReason })
    }

    res.json({ success: true, status: state })
  } catch (err) {
    next(err)
  }
}

export const getLessonPlan = async (req, res, next) => {
  try {
    const content = await GeneratedContent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      type: 'lessonPlan'
    })
    if (!content) return res.status(404).json({ success: false, message: 'Lesson plan not found' })
    res.json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const listLessonPlans = async (req, res, next) => {
  try {
    const plans = await GeneratedContent.find({ userId: req.user._id, type: 'lessonPlan' })
      .sort({ createdAt: -1 })
      .select('input output.title createdAt aiProvider')
    res.json({ success: true, data: plans })
  } catch (err) {
    next(err)
  }
}
