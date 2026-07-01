import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export const validate = (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(', ')
      })
      return
    }
    req.body = value
    next()
  }
