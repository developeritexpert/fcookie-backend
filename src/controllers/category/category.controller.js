const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const { ErrorHandler } = require('../../utils/error-handler');
const authService = require('../../services/auth/auth.service');

const createCategory = wrapAsync(async (req, res) => {
  const result = 'await authService.register(req.body)';
  sendResponse(res, result.data, result.message, 201);
});


module.exports = {
  createCategory,
};
