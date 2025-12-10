const Category = require('../../models/category.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { uploadBuffer, deleteFromCloudinary } = require('../../utils/cloudinary');

/**
 * Create a new category with optional icon upload
 */
const createCategory = async (payload, file = null) => {
  try {
    // Upload icon to Cloudinary if file is provided
    if (file) {
      const uploadResult = await uploadBuffer(file.buffer, {
        folder: 'categories/icons',
        resource_type: 'image',
      });
      payload.icon = uploadResult.secure_url;
    }

    const category = await Category.create(payload);
    return category;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'category.name_exists');
    }
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

/**
 * Get all categories with pagination and filters
 */
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

/**
 * Get category by ID
 */
const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new ErrorHandler(404, 'category.not_found');
  return category;
};

/**
 * Update category with optional icon upload
 */
const updateCategory = async (id, payload, file = null) => {
  try {
    // Get existing category to check for old icon
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      throw new ErrorHandler(404, 'category.not_found');
    }

    // Upload new icon to Cloudinary if file is provided
    if (file) {
      const uploadResult = await uploadBuffer(file.buffer, {
        folder: 'categories/icons',
        resource_type: 'image',
      });
      payload.icon = uploadResult.secure_url;

      // Optionally delete old icon from Cloudinary
      if (existingCategory.icon) {
        try {
          await deleteFromCloudinary(existingCategory.icon);
        } catch (deleteErr) {
          console.error('Failed to delete old icon from Cloudinary:', deleteErr);
        }
      }
    }

    // If removeIcon flag is set, remove the icon
    if (payload.removeIcon === 'true' || payload.removeIcon === true) {
      if (existingCategory.icon) {
        try {
          await deleteFromCloudinary(existingCategory.icon);
        } catch (deleteErr) {
          console.error('Failed to delete icon from Cloudinary:', deleteErr);
        }
      }
      payload.icon = null;
      delete payload.removeIcon;
    }

    const updated = await Category.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'category.name_exists');
    }
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

/**
 * Delete category and its icon from Cloudinary
 */
const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new ErrorHandler(404, 'category.not_found');

  // Delete icon from Cloudinary if exists
  if (category.icon) {
    try {
      await deleteFromCloudinary(category.icon);
    } catch (deleteErr) {
      console.error('Failed to delete icon from Cloudinary:', deleteErr);
    }
  }

  await Category.findByIdAndDelete(id);
  return true;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};