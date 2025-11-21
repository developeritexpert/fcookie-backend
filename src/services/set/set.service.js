const Set = require('../../models/set.model');
const Category = require('../../models/category.model');
const { ErrorHandler } = require('../../utils/error-handler');

const createSet = async (payload) => {
  const category = await Category.findById(payload.categoryId);
  if (!category) throw new ErrorHandler(404, 'category.not_found');

  try {
    const set = await Set.create(payload);
    return set;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'set.name_exists');
    }
    throw new ErrorHandler(500, err.message);
  }
};

const getAllSets = async (page, limit, filters, sortBy = 'createdAt', order = 'desc') => {
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const sort = {};
  sort[sortBy] = sortOrder;

  const [sets, total] = await Promise.all([
    Set.find(filters).populate('categoryId', 'name slug status').sort(sort).skip(skip).limit(limit),
    Set.countDocuments(filters),
  ]);

  return {
    data: sets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSetById = async (id) => {
  const set = await Set.findById(id).populate('categoryId', 'name slug status');
  if (!set) throw new ErrorHandler(404, 'set.not_found');
  return set;
};

const updateSet = async (id, payload) => {
  try {
    if (payload.categoryId) {
      const category = await Category.findById(payload.categoryId);
      if (!category) throw new ErrorHandler(404, 'category.not_found');
    }

    const updated = await Set.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name slug status');

    if (!updated) throw new ErrorHandler(404, 'set.not_found');

    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'set.slug_exists');
    }
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(500, 'errors.internal_server_error');
  }
};

const deleteSet = async (id) => {
  const deleted = await Set.findByIdAndDelete(id);
  if (!deleted) throw new ErrorHandler(404, 'set.not_found');
  return true;
};

module.exports = {
  createSet,
  getAllSets,
  getSetById,
  updateSet,
  deleteSet,
};
