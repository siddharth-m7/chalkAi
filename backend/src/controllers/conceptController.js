import { generateWithAI, parseJsonFromAI } from '../services/aiService.js'
import { buildConceptSystemPrompt, buildConceptUserPrompt, EXPLANATION_TYPES } from '../utils/prompts/conceptPrompt.js'
import GeneratedContent from '../models/GeneratedContent.js'

export const explainConcept = async (req, res, next) => {
  try {
    const { concept, subject, gradeLevel, additionalContext } = req.body
    const systemPrompt = buildConceptSystemPrompt()

    // Fire all 5 explanations in parallel
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

    const successfulProvider = settled.find((r) => r.status === 'fulfilled')?.value?.provider || 'groq'

    const content = await GeneratedContent.create({
      userId: req.user._id,
      type: 'conceptExplain',
      input: req.body,
      output: { concept, subject, gradeLevel, explanations },
      aiProvider: successfulProvider
    })

    res.status(201).json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const getConcept = async (req, res, next) => {
  try {
    const content = await GeneratedContent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      type: 'conceptExplain'
    })
    if (!content) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: content })
  } catch (err) {
    next(err)
  }
}

export const listConcepts = async (req, res, next) => {
  try {
    const items = await GeneratedContent.find({ userId: req.user._id, type: 'conceptExplain' })
      .sort({ createdAt: -1 })
      .select('input output.concept createdAt aiProvider')
    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
}
