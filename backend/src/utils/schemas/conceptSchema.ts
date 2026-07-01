import Joi from 'joi'

export const conceptSchema = Joi.object({
  concept:           Joi.string().trim().min(2).max(200).required(),
  subject:           Joi.string().trim().allow('').optional(),
  gradeLevel:        Joi.string().trim().allow('').optional(),
  additionalContext: Joi.string().trim().max(500).allow('').optional()
})
