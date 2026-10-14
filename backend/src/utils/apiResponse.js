/**
 * Standardized API Response Utilities
 */

export const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const error = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const paginated = (res, data = [], page = 1, limit = 10, total = 0, message = 'Success') => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const totalNum = parseInt(total, 10) || 0;
  const totalPages = Math.ceil(totalNum / limitNum) || 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  });
};

export default {
  success,
  error,
  paginated
};
