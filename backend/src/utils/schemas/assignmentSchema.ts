import Joi from 'joi'

export const assignmentSchema = Joi.object({
  title:       Joi.string().trim().max(200).allow('').optional(),
  schoolName:  Joi.string().trim().max(200).allow('').optional(),
  subject:     Joi.string().trim().required(),
  gradeLevel:  Joi.string().trim().required(),
  chapter:     Joi.string().trim().allow('').optional(),
  topic:       Joi.string().trim().allow('').optional(),
  dueDate:     Joi.date().allow(null, '').optional(),
  difficulty:  Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  questionSections: Joi.array()
    .items(
      Joi.object({
        type:            Joi.string().valid('mcq', 'short_answer', 'long_answer', 'true_false', 'numerical').required(),
        count:           Joi.number().integer().min(1).max(20).required(),
        marksPerQuestion: Joi.number().integer().min(1).max(20).required()
      })
    )
    .min(1)
    .required(),
  additionalInfo: Joi.string().trim().max(500).allow('').optional()
})
