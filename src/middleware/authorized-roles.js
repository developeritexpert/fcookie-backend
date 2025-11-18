const { ErrorHandler } = require('../utils/error-handler');

const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return next(new ErrorHandler(401, 'errors.you_are_unauthorized'));
    }
  };
};

module.exports = authorizeRoles;
