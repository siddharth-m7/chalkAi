import { Request, Response, NextFunction } from 'express'
import { generateWithAI, parseJsonFromAI } from '../services/aiService'
import { buildConceptSystemPrompt, buildConceptUserPrompt, EXPLANATION_TYPES } from '../utils/prompts/conceptPrompt'
import GeneratedContent from '../models/GeneratedContent'

export const explainConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { concept, subject, gradeLevel, additionalContext } = req.body
    const systemPrompt = buildConceptSystemPrompt()

    const settled = await Promise.allSettled(
      EXPLANATION_TYPES.map(({ type }) =>
        generateWithAI(systemPrompt, buildConceptUserPrompt(concept, subject, gradeLevel, type, additionalContext))
      )
    )

    const explanations = settled.map((result, i) => {
      const { type, label, icon } = EXPLANATION_TYPES[i]
      if (result.status === 'fulfilled') {
        try {
          const parsed = parseJsonFromAI(result.value.text)
          return { type, label, icon, ...parsed, success: true }
        } catch {
          return { type, label, icon, success: false, content: null }
        }
      }
      return { type, label, icon, success: false, content: null }
    })

    const successfulProvider = settled.find((r) => r.status === 'fulfilled')
    const aiProvider = successfulProvider?.status === 'fulfilled' ? successfulProvider.value.provider : 'groq'

    const content = await GeneratedContent.create({
      userId: req.user._id,
      type:   'conceptExplain',
      input:  req.body,
      output: { concept, subject, gradeLevel, explanations },
      aiProvider
    })

    res.status(201).json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const getConcept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const content = await GeneratedContent.findOne({
      _id:    req.params.id,
      userId: req.user._id,
      type:   'conceptExplain'
    })
    if (!content) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const listConcepts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await GeneratedContent.find({ userId: req.user._id, type: 'conceptExplain' })
      .sort({ createdAt: -1 })
      .select('input output.concept createdAt aiProvider')
    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
}
