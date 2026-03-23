import { BadRequestError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new BadRequestError(message));
  }
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new BadRequestError(message));
  }
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new BadRequestError(message));
  }
  next();
};
