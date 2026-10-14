import { error as sendError } from '../utils/apiResponse.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to access this resource.', 403);
    }
    next();
  };
};

export default authorize;
