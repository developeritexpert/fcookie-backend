const Category = require('../../models/category.model');
const { ErrorHandler } = require('../../utils/error-handler');

const createCategory = async (payload) => {
  try {
    return await Category.create(payload);
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'category.name_exists');
    }
    throw new ErrorHandler(500, err.message);
  }
};

const getAllCategories = async (page, limit, filters, sortBy = 'createdAt', order = 'desc') => {
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const sort = {};
  sort[sortBy] = sortOrder;

  const [categories, total] = await Promise.all([
    Category.find(filters).sort(sort).skip(skip).limit(limit),

    Category.countDocuments(filters),
  ]);

  return {
    data: categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new ErrorHandler(404, 'category.not_found');
  return category;
};

const updateCategory = async (id, payload) => {
  const updated = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw new ErrorHandler(404, 'category.not_found');
  return updated;
};

const deleteCategory = async (id) => {
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new ErrorHandler(404, 'category.not_found');
  return true;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
