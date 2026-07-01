import { Request, Response, NextFunction } from 'express'
import PersonalLibrary from '../models/PersonalLibrary'
import GeneratedContent from '../models/GeneratedContent'

export const saveToLibrary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { contentId, title } = req.body
    if (!contentId) {
      res.status(400).json({ success: false, message: 'contentId is required' })
      return
    }

    const content = await GeneratedContent.findOne({ _id: contentId, userId: req.user._id })
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' })
      return
    }

    const existing = await PersonalLibrary.findOne({ userId: req.user._id, contentId })
    if (existing) {
      res.status(409).json({ success: false, message: 'Already saved to library' })
      return
    }

    const output = content.output as Record<string, unknown>
    const item = await PersonalLibrary.create({
      userId:    req.user._id,
      contentId,
      itemType:  content.type,
      title:     title || (output?.title as string) || 'Untitled'
    })

    res.status(201).json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
}

export const listLibrary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await PersonalLibrary.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('contentId', 'type output createdAt')
    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
}

export const removeFromLibrary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await PersonalLibrary.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' })
      return
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
