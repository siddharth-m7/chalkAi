import { Request, Response, NextFunction } from 'express'
import { generateWithAI, parseJsonFromAI } from '../services/aiService'
import { buildAssignmentSystemPrompt, buildAssignmentUserPrompt } from '../utils/prompts/assignmentPrompt'
import GeneratedContent from '../models/GeneratedContent'

export const generateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input        = req.body
    const systemPrompt = buildAssignmentSystemPrompt()
    const userPrompt   = buildAssignmentUserPrompt(input)

    const { text, provider } = await generateWithAI(systemPrompt, userPrompt)
    const parsed = parseJsonFromAI(text)

    const content = await GeneratedContent.create({
      userId: req.user._id,
      type:   'assignment',
      input,
      output: parsed,
      aiProvider: provider
    })

    res.status(201).json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const getAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const content = await GeneratedContent.findOne({
      _id:    req.params.id,
      userId: req.user._id,
      type:   'assignment'
    })
    if (!content) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }
    res.json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const listAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignments = await GeneratedContent.find({ userId: req.user._id, type: 'assignment' })
      .sort({ createdAt: -1 })
      .select('input output.title createdAt aiProvider')
    res.json({ success: true, data: assignments })
  } catch (err) {
    next(err)
  }
}
