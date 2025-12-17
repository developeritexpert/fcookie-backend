const { wrapAsync } = require('../utils/wrap-async');
const UserService = require('../services/user.service');
const { sendResponse } = require('../utils/response');
const { ErrorHandler } = require('../utils/error-handler');
const { User } = require('../models/user.model');

const create = wrapAsync(async (req, res) => {
  const user = await UserService.createUser(req.body);
  sendResponse(res, { user }, 'user.create_success');
});




const getAll = wrapAsync(async (req, res) => {
  const filter = {
    isDeleted: false, // 🔥 enforce soft delete
  };

  // Active filter
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Role filter
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // 🔍 SEARCH
  if (req.query.search) {
    const search = req.query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const limit = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const data = await UserService.listUsers(filter, { limit, skip });

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

module.exports = { getAll, getOne, update, remove,create };
