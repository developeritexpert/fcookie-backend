const { wrapAsync } = require('../utils/wrap-async');
const UserService = require('../services/user.service');
const { sendResponse } = require('../utils/response');
const { ErrorHandler } = require('../utils/error-handler');

const getAll = wrapAsync(async (req, res) => {
  const data = await UserService.listUsers();
  sendResponse(res, { data }, 'user.fetch_success');
});

const getOne = wrapAsync(async (req, res) => {
  const user = await UserService.getUserByID(req.params.userId);
  sendResponse(res, { user }, 'user.fetch_success');
});

const update = wrapAsync(async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.userId) {
    throw new ErrorHandler(403, 'user.not_authorized');
  }
  const user = await UserService.updateUser(req.params.userId, req.body);
  sendResponse(res, { user }, 'user.update_success');
});

const remove = wrapAsync(async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.userId) {
    throw new ErrorHandler(403, 'user.not_authorized');
  }
  await UserService.deleteUser(req.params.userId);
  sendResponse(res, {}, 'user.delete_success');
});

module.exports = { getAll, getOne, update, remove };
