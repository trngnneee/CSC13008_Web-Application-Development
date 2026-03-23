export const successResponse = (res, { message = 'Success', data = null, statusCode = 200 } = {}) => {
  const response = {
    code: 'success',
    message,
  };

  if (data !== null) {
    Object.assign(response, typeof data === 'object' && !Array.isArray(data) ? data : { data });
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, { message = 'Error', statusCode = 400 } = {}) => {
  return res.status(statusCode).json({
    code: 'error',
    message,
  });
};
