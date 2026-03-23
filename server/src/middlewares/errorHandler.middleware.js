import { AppError } from '../utils/AppError.js';

export const errorHandler = (err, req, res, _next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      code: 'error',
      message: err.message,
    });
  }

  console.error('[Unhandled Error]', err);

  return res.status(500).json({
    code: 'error',
    message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
  });
};
