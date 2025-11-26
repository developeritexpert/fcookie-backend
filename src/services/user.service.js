const { User } = require('../models/user.model');
const { ErrorHandler } = require('../utils/error-handler');

const getUserByEmail = (email, includePassword = false) => {
  const proj = includePassword ? {} : { password: 0 };
  return User.findOne({ email }, proj).exec();
};

const getUserByID = async (userId, includePassword = false) => {
  const projection = includePassword ? {} : { password: 0 };
  const user = await User.findById(userId, projection).exec();
  if (!user) throw new ErrorHandler(404, 'user.not_found');
  return user;
};

const listUsers = (filter = {}, opts = {}) => {
  const { limit = 20, skip = 0 } = opts;
  return User.find(filter).limit(limit).skip(skip).select('-password').exec();
};

const updateUser = (id, data) => {
  const allowedFields = ['name', 'email', 'phoneNumber', 'avatar', 'password', 'address', 'companyName'];
  const updates = {};

  Object.keys(data).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = data[key];
    }
  });

  return User.findByIdAndUpdate(id, updates, { new: true }).select('-password').exec();
};

const deleteUser = (id) => User.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();

module.exports = { getUserByEmail, getUserByID, listUsers, updateUser, deleteUser };
