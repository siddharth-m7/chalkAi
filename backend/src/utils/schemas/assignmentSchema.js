import Joi from 'joi'

export const assignmentSchema = Joi.object({
  subject: Joi.string().trim().required(),
  gradeLevel: Joi.string().trim().required(),
  chapter: Joi.string().trim().allow('').optional(),
  topic: Joi.string().trim().allow('').optional(),
  numberOfQuestions: Joi.number().min(1).max(20).default(10),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  questionTypes: Joi.array()
    .items(Joi.string().valid('mcq', 'short_answer', 'long_answer', 'true_false'))
    .min(1)
    .required()
})
