import Joi from 'joi'

export const lessonPlanSchema = Joi.object({
  subject:            Joi.string().trim().required(),
  gradeLevel:         Joi.string().trim().required(),
  chapter:            Joi.string().trim().allow('').optional(),
  topic:              Joi.string().trim().allow('').optional(),
  weekStartDate:      Joi.date().allow(null, '').optional(),
  numberOfDays:       Joi.number().integer().min(1).max(5).default(5),
  classDuration:      Joi.number().valid(30, 45, 60, 90).default(45),
  learningObjectives: Joi.string().trim().max(500).allow('').optional(),
  additionalInfo:     Joi.string().trim().max(500).allow('').optional()
})
